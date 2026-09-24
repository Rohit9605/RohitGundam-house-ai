import cgi, json, mimetypes, os, subprocess, threading, uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

ROOT=Path(os.environ.get("HUNYUAN_WORLD_DIR","")).expanduser()
JOBS=Path(__file__).parent/"jobs"; JOBS.mkdir(exist_ok=True)
state={}

def run_job(jid,img):
    out=JOBS/jid
    try:
        state[jid]={"status":"panorama","progress":15}
        subprocess.run(["python3",str(ROOT/"demo_panogen.py"),"--prompt","photorealistic luxury residential architecture, coherent rooms and materials","--negative_prompt","low poly, cartoon, illustration, distorted architecture","--image_path",str(img),"--output_path",str(out)],cwd=ROOT,check=True)
        pano=out/"panorama.png"
        if not pano.exists(): raise RuntimeError("panorama.png was not produced")
        state[jid]={"status":"scene","progress":55}
        subprocess.run(["python3",str(ROOT/"demo_scenegen.py"),"--image_path",str(pano),"--labels_fg1","furniture","plants","--labels_fg2","trees","mountains","--classes","outdoor","--output_path",str(out)],cwd=ROOT,check=True)
        meshes=sorted(out.glob("mesh_layer*.ply"))
        urls=[f"http://127.0.0.1:8787/files/{jid}/{p.name}" for p in meshes]
        state[jid]={"status":"complete","progress":100,"meshes":urls,"panorama":f"http://127.0.0.1:8787/files/{jid}/panorama.png"}
    except Exception as e: state[jid]={"status":"error","error":str(e)}

class H(BaseHTTPRequestHandler):
    def cors(self): self.send_header("Access-Control-Allow-Origin","*")
    def sendj(self,obj,code=200):
        b=json.dumps(obj).encode(); self.send_response(code); self.send_header("Content-Type","application/json"); self.cors(); self.send_header("Content-Length",str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_OPTIONS(self):
        self.send_response(204); self.cors(); self.send_header("Access-Control-Allow-Methods","GET,POST,OPTIONS"); self.send_header("Access-Control-Allow-Headers","Content-Type"); self.end_headers()
    def do_GET(self):
        if self.path=="/health": return self.sendj({"ok":ROOT.exists() and (ROOT/"demo_panogen.py").exists(),"world_dir":str(ROOT)})
        if self.path.startswith("/jobs/"): return self.sendj(state.get(self.path.split("/")[-1],{"status":"missing"}))
        if self.path.startswith("/files/"):
            parts=unquote(self.path).split("/")
            if len(parts)!=4: return self.sendj({"error":"bad path"},400)
            p=(JOBS/parts[2]/parts[3]).resolve()
            if JOBS.resolve() not in p.parents or not p.exists(): return self.sendj({"error":"not found"},404)
            b=p.read_bytes(); self.send_response(200); self.send_header("Content-Type",mimetypes.guess_type(p.name)[0] or "application/octet-stream"); self.cors(); self.send_header("Content-Length",str(len(b))); self.end_headers(); self.wfile.write(b); return
        self.sendj({"error":"not found"},404)
    def do_POST(self):
        if self.path!="/generate": return self.sendj({"error":"not found"},404)
        if not ROOT.exists(): return self.sendj({"error":"HUNYUAN_WORLD_DIR is not configured."},503)
        form=cgi.FieldStorage(fp=self.rfile,headers=self.headers,environ={"REQUEST_METHOD":"POST","CONTENT_TYPE":self.headers.get("Content-Type","")})
        f=form["image"] if "image" in form else None
        if f is None or not getattr(f,"file",None): return self.sendj({"error":"image is required"},400)
        jid=uuid.uuid4().hex[:12]; out=JOBS/jid; out.mkdir()
        img=out/"input.png"; img.write_bytes(f.file.read()); state[jid]={"status":"queued","progress":0}
        threading.Thread(target=run_job,args=(jid,img),daemon=True).start()
        self.sendj({"jobId":jid,"status":"queued"},202)

if __name__=="__main__":
 print("House AI local world bridge: http://127.0.0.1:8787")
 ThreadingHTTPServer(("127.0.0.1",8787),H).serve_forever()
