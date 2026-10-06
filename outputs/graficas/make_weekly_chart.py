import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
out=Path(__file__).parent
data=json.loads((out/"semana_nasa.json").read_text())
def font(n,b=False):
    return ImageFont.truetype("C:/Windows/Fonts/"+("arialbd.ttf" if b else "arial.ttf"),n)
im=Image.new("RGB",(1600,920),"white")
draw=ImageDraw.Draw(im)
ink="#17233d"
left,right,top,bottom=185,1470,185,730
draw.text((800,34),"Generación diaria pronosticada",font=font(40,True),anchor="mt",fill=ink)
draw.text((800,88),"Semana del 5 al 11 de mayo de 2025",font=font(28),anchor="mt",fill="#4c5568")
for v in range(0,3501,500):
    y=bottom-(bottom-top)*v/3500
    draw.line((left,y,right,y),fill="#d9dee8",width=2)
    draw.text((left-20,y),f"{v:,}",font=font(26),anchor="rm",fill="#4c5568")
for i,lab in enumerate(["Lun 5","Mar 6","Mié 7","Jue 8","Vie 9","Sáb 10","Dom 11"]):
    x=left+(right-left)*i/6
    draw.text((x,bottom+23),lab,font=font(27),anchor="mt",fill=ink)
draw.line((left,bottom,right,bottom),fill=ink,width=3)
f=font(28,True); text="Generación diaria (kWh)"; box=f.getbbox(text)
layer=Image.new("RGBA",(box[2]-box[0]+12,box[3]-box[1]+12))
ImageDraw.Draw(layer).text((6-box[0],6-box[1]),text,font=f,fill=ink)
layer=layer.rotate(90,expand=True); im.paste(layer,(35,round((top+bottom-layer.height)/2)),layer)
for j,(row,color,name) in enumerate(zip(data,["#2563a6","#e38b28"],["Monterrey","Tixméhuac"])):
    vals=list(row["days"].values())
    assert len(vals)==7
    points=[(left+(right-left)*i/6,bottom-(bottom-top)*v/3500) for i,v in enumerate(vals)]
    draw.line(points,fill=color,width=6)
    for x,y in points: draw.ellipse((x-7,y-7,x+7,y+7),fill=color,outline="white",width=2)
    k=max(range(7),key=vals.__getitem__); x,y=points[k]
    draw.ellipse((x-11,y-11,x+11,y+11),fill=color,outline="white",width=3)
    tx=x-8 if j==0 else x
    anchor="rs" if j==0 else "ms"
    draw.text((tx,y-25),f"Máx. {vals[k]:,.2f} kWh",font=font(29,True),anchor=anchor,fill=color,stroke_width=3,stroke_fill="white")
    lx=570+j*320
    draw.line((lx,827,lx+55,827),fill=color,width=6)
    draw.text((lx+70,827),name,font=font(28),anchor="lm",fill=ink)
draw.text((800,888),"Fuente: NASA POWER · 390 kW · Factor de desempeño: 85%",font=font(24),anchor="ms",fill="#4c5568")
im.save(out/"maximos_generacion_2025.png",dpi=(220,220))
