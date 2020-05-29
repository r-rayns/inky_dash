from inky import InkyPHAT
from PIL import Image
import os
import sys

display_colour = str(sys.argv[1])
border_colour = str(sys.argv[2])
current_directory = os.path.dirname(os.path.abspath(__file__))
image_directory = os.path.join(current_directory, "../current_image")

def main():
    validate_arg_string(display_colour, ['red', 'yellow'])
    validate_arg_string(border_colour, ['white', 'black'])
    image_path = os.path.join(image_directory, "inky.png")
    image = Image.open(image_path)
    try:
        display_image(image)
    except Exception as e:
        sys.stderr.write(str(e))
        sys.exit(1)
    sys.exit(0)

def display_image(image):
    palette_image = new_palette_image(image.size)
    converted_image = convert_to_palette(image, palette_image)
    set_inky_display(converted_image)

def new_palette_image(size):
    palette_image = Image.new("P", size)
    palette_image.putpalette(get_palette(display_colour))
    return palette_image

def convert_to_palette(image, palette_image):
    # ensure RGB format before conversion
    old_image = image.convert("RGB")
    new_image = old_image.quantize(3, palette = palette_image)
    new_image_path = os.path.join(image_directory, "new.png")
    new_image.save(new_image_path)
    return Image.open(new_image_path)

def set_inky_display(image):
    inky_display = InkyPHAT(display_colour)
    inky_display.set_image(image)
    inky_border = inky_display.WHITE if border_colour == 'white' else inky_display.BLACK
    inky_display.set_border(inky_border)
    inky_display.show()

def get_palette(palette_colour):
    # must be in order of white, black, colour(yellow or red)
    if(palette_colour == 'yellow'):
        return [255,255,255,0,0,0,198,155,43]
    else:
        # red
        return [255,255,255,0,0,0,255,0,0]

def validate_arg_string(arg, accepted_args):
    if arg not in accepted_args:
        sys.exit(arg + " is not an accepted argument," +
        "it must be one of the following: "+str(accepted_args))
    else:
        return arg


if __name__ == "__main__":
    main()
