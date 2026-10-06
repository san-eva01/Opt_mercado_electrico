from PIL import Image, ImageDraw, ImageFont


OUT = r"D:\proyecto_cenace\Opt_mercado_electrico\outputs\graficas"
MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
MTY = [26017.43, 30397.95, 47663.22, 39484.65, 42062.35, 35048.65, 32060.57, 34720.22, 26434.68, 26709.24, 22983.35, 18314.19]
TIX = [40766.77, 42127.64, 62031.93, 81502.20, 158858.09, 70769.73, 63158.34, 64161.73, 51938.09, 55525.69, 35467.03, 45569.23]


def font(size, bold=False):
    name = r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"
    return ImageFont.truetype(name, size)


def vertical_label(im, text, x, y):
    f = font(25, True)
    box = f.getbbox(text)
    layer = Image.new("RGBA", (box[2]-box[0]+12, box[3]-box[1]+12))
    ImageDraw.Draw(layer).text((6-box[0], 6-box[1]), text, font=f, fill="#17233d")
    layer = layer.rotate(90, expand=True)
    im.paste(layer, (round(x-layer.width/2), round(y-layer.height/2)), layer)


def money_chart():
    w, h = 1800, 760
    im = Image.new("RGB", (w, h), "white")
    d = ImageDraw.Draw(im)
    left, top, right, bottom = 180, 100, 55, 125
    pw, ph = w-left-right, h-top-bottom
    ymax = 180000
    d.text((w/2, 28), "Ingreso mensual calculado para 2025", anchor="ma", font=font(34, True), fill="#17233d")
    for v in range(0, ymax+1, 30000):
        y = top + ph*(1-v/ymax)
        d.line((left, y, w-right, y), fill="#d9dee8", width=2)
        d.text((left-15, y), f"{v/1000:.0f} mil", anchor="rm", font=font(22), fill="#4c5568")
    group = pw/12
    bw = group*0.30
    colors = ("#2563a6", "#e38b28")
    for i, m in enumerate(MONTHS):
        cx = left + group*(i+.5)
        for val, off, color in ((MTY[i], -bw*.55, colors[0]), (TIX[i], bw*.55, colors[1])):
            bh = ph*val/ymax
            d.rectangle((cx+off-bw/2, top+ph-bh, cx+off+bw/2, top+ph), fill=color)
        d.text((cx, top+ph+18), m, anchor="ma", font=font(23), fill="#17233d")
    d.line((left, top+ph, w-right, top+ph), fill="#17233d", width=3)
    vertical_label(im, "Ingreso (MXN)", 36, top+ph/2)
    lx = w-540
    d.rectangle((lx, 53, lx+28, 81), fill=colors[0]); d.text((lx+40, 67), "Monterrey", anchor="lm", font=font(23), fill="#17233d")
    d.rectangle((lx+235, 53, lx+263, 81), fill=colors[1]); d.text((lx+275, 67), "Tixméhuac", anchor="lm", font=font(23), fill="#17233d")
    d.text((w/2, h-28), "Fuente: salida anual de la plataforma; 390 kW, 85% de eficiencia.", anchor="ms", font=font(21), fill="#4c5568")
    im.save(OUT + r"\ingresos_mensuales_2025.png", dpi=(220,220))


def max_chart():
    w, h = 1300, 680
    im = Image.new("RGB", (w, h), "white")
    d = ImageDraw.Draw(im)
    left, top, right, bottom = 170, 110, 80, 150
    pw, ph = w-left-right, h-top-bottom
    ymax = 3200
    d.text((w/2, 28), "Máximo diario de generación en 2025", anchor="ma", font=font(34, True), fill="#17233d")
    for v in range(0, ymax+1, 800):
        y = top + ph*(1-v/ymax)
        d.line((left, y, w-right, y), fill="#d9dee8", width=2)
        d.text((left-18, y), f"{v:,}", anchor="rm", font=font(23), fill="#4c5568")
    vals = [2846.88, 2601.00]
    labels = ["Monterrey\n11 mayo", "Tixméhuac\n7 mayo"]
    colors = ["#2563a6", "#e38b28"]
    for i, (v, lab, color) in enumerate(zip(vals, labels, colors)):
        cx = left + pw*(.30+.40*i)
        bw = 210
        bh = ph*v/ymax
        d.rectangle((cx-bw/2, top+ph-bh, cx+bw/2, top+ph), fill=color)
        d.text((cx, top+ph-bh-18), f"{v:,.2f} kWh", anchor="ms", font=font(27, True), fill="#17233d")
        d.multiline_text((cx, top+ph+20), lab, anchor="ma", align="center", spacing=6, font=font(25), fill="#17233d")
    d.line((left, top+ph, w-right, top+ph), fill="#17233d", width=3)
    vertical_label(im, "Generación (kWh)", 36, top+ph/2)
    d.text((w/2, h-30), "Semana mostrada por la interfaz: 5–11 de mayo de 2025", anchor="ms", font=font(23, True), fill="#4c5568")
    im.save(OUT + r"\maximos_generacion_2025.png", dpi=(220,220))


money_chart()
max_chart()

