import os
from PIL import Image

def comprimir_a_webp(carpeta_origen, carpeta_destino, calidad=80):
    # Verifica si la carpeta de destino existe, si no, la crea
    if not os.path.exists(carpeta_destino):
        os.makedirs(carpeta_destino)

    # Solo procesaremos estos formatos
    extensiones_validas = ('.jpg', '.jpeg', '.png')

    # Recorremos cada archivo de la carpeta origen
    for archivo in os.listdir(carpeta_origen):
        if archivo.lower().endswith(extensiones_validas):
            ruta_origen = os.path.join(carpeta_origen, archivo)
            
            try:
                # Abrimos la imagen original
                with Image.open(ruta_origen) as img:
                    # Separamos el nombre de la extensión original
                    nombre_base = os.path.splitext(archivo)[0]
                    # Armamos la ruta final con la extensión .webp
                    ruta_salida = os.path.join(carpeta_destino, f"{nombre_base}.webp")
                    
                    # Guardamos aplicando la compresión
                    img.save(ruta_salida, 'webp', quality=calidad)
                    print(f"✅ Éxito: {archivo} -> {nombre_base}.webp (Calidad: {calidad}%)")
                    
            except Exception as e:
                print(f"❌ Error al procesar {archivo}: {e}")

# Rutas apuntando a las carpetas de tu proyecto
input_dir = 'imagenes_originales' 
output_dir = 'imagenes_optimizadas'

print("Iniciando compresión de panorámicas...")
comprimir_a_webp(input_dir, output_dir, calidad=80)
print("Proceso finalizado con éxito.")