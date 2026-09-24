import cgi, json, os, subprocess, threading, uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT=Path(os.environ.get("HUNYUAN_WORLD_DIR","")).expanduser()
JOBS=Path(__file__).parent/"jobs"; JOBS.mkdir(exist_ok=True)
state={}

def run_job(jid,img):
    out=JOBS/jid
    try:
        state[jid]={"status":"panorama"}
        subprocess.run(["python3",str(ROOT/"demo_panogen.py"),"--prompt","","--image_path",str(img),"--output_path",str(out)],cwd=ROOT,check=True)
        pano=out/"panorama.png"
        if not pano.exists(): raise RuntimeError("panorama.png was not produced")
        state[jid]={"status":"scene"}
        subprocess.run(["python3",str(ROOT/"demo_scenegen.py"),"--image_path",str(pano),"--labels_fg1","plants","furniture","--labels_fg2","trees","mountains","--classes","outdoor","--output_path",str(out)],cwd=ROOT,check=True)
        meshes=[str(p.relative_to(out)) for ext in ("*.glb","*.gltf","*.drc","*.obj","*.ply") for p in out.rglob(ext)]
        state[jid]={"status":"complete","output":str(out),"meshes":meshes}
    except Exception as e: state[jid]={"status":"error","error":str(e)}

class H(BaseHTTPRequestHandler):
    def sendj(self,obj,code=200):
        b=json.dumps(obj).encode(); self.send_response(code); self.send_header("Content-Type","application/json"); self.send_header("Access-Control-Allow-Origin","*"); self.send_header("Content-Length",str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        if self.path=="/health": return self.sendj({"ok":ROOT.exists(),"world_dir":str(ROOT)})
        if self.path.startswith("/jobs/"): return self.sendj(state.get(self.path.split("/")[-1],{"status":"missing"}))
        self.sendj({"error":"not found"},404)
    def do_POST(self):
        if self.path!="/generate": return self.sendj({"error":"not found"},404)
        if not ROOT.exists(): return self.sendj({"error":"Set HUNYUAN_WORLD_DIR to your local HunyuanWorld clone."},503)
        form=cgi.FieldStorage(fp=self.rfile,headers=self.headers,environ={"REQUEST_METHOD":"POST","CONTENT_TYPE":self.headers.get("Content-Type","")})
        f=form["image"] if "image" in form else None
        if f is None or not getattr(f,"file",None): return self.sendj({"error":"image is required"},400)
        jid=uuid.uuid4().hex[:12]; out=JOBS/jid; out.mkdir()
        img=out/"input.png"; img.write_bytes(f.file.read()); state[jid]={"status":"queued"}
        threading.Thread(target=run_job,args=(jid,img),daemon=True).start()
        self.sendj({"jobId":jid,"status":"queued"},202)

if __name__=="__main__":
    print("House AI local world bridge: http://127.0.0.1:8787")
    ThreadingHTTPServer(("127.0.0.1",8787),H).serve_forever()
