from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]


def make_icon(size: int) -> None:
    scale = size / 512
    image = Image.new("RGB", (size, size), "#07111f")
    draw = ImageDraw.Draw(image)
    radius = int(108 * scale)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill="#07111f")
    ring = tuple(int(v * scale) for v in (84, 84, 428, 428))
    draw.ellipse(ring, outline="#155f65", width=max(6, int(24 * scale)))
    draw.arc(ring, start=205, end=510, fill="#20e3b2", width=max(8, int(28 * scale)))
    draw.rounded_rectangle(tuple(int(v * scale) for v in (116, 188, 396, 324)), radius=int(28 * scale), fill="#0c192b", outline="#20e3b2", width=max(3, int(8 * scale)))
    font_path = Path("C:/Windows/Fonts/arialbd.ttf")
    font = ImageFont.truetype(str(font_path), max(34, int(98 * scale))) if font_path.exists() else ImageFont.load_default()
    draw.text((158 * scale, 199 * scale), "RF", font=font, fill="#20e3b2", stroke_width=max(1, int(2 * scale)), stroke_fill="#20e3b2")
    draw.ellipse(tuple(int(v * scale) for v in (360, 104, 402, 146)), fill="#fbbf24")
    image.save(ROOT / "icons" / f"icon-{size}.png", optimize=True)


for icon_size in (192, 512):
    make_icon(icon_size)
