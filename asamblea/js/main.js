// ============================================================
// CONFIGURACIÓN DE ESCENAS
// ============================================================
const basePathPano = "optimizador_recorridos/imagenes_optimizadas";

const escenasData = [
    { id: 'fachada', nombre: 'Fachada Principal', miniatura: 'assets/miniaturas/uno.png', carpeta: 'fachada' },
    { id: 'escena_160', nombre: 'Parqueadero Sector 16', miniatura: 'assets/miniaturas/dos.png', carpeta: '160' },
    { id: 'escena_161', nombre: 'Parqueadero Sector 16', miniatura: 'assets/miniaturas/dos_.png', carpeta: '161' },
    { id: 'dosytres', nombre: 'Cubierta Sector 2 y 3', miniatura: 'assets/miniaturas/tres.png', carpeta: 'dosytres' },
    { id: 'quincalla', nombre: 'Sector Quincalla', miniatura: 'assets/miniaturas/cuatro.png', carpeta: 'quincalla' },
    { id: 'rivolly', nombre: 'Sector Rivolly', miniatura: 'assets/miniaturas/cinco.png', carpeta: 'rivolly' },
    { id: 'escena_solar', nombre: 'Techo Solar HD', miniatura: 'assets/miniaturas/seis.png', carpeta: 'solar_pano' },
    { id: 'sub1', nombre: 'Subestación 1', miniatura: 'assets/miniaturas/siete.png', carpeta: 'sub1',
      hotSpots: [
          {
              "pitch": -89.21,
              "yaw": -122.65,
              "cssClass": "custom-nadir-hotspot",
              "createTooltipFunc": nadirTooltip,
              "createTooltipArgs": "assets/marca.png",
              "scale": true
          }
      ]
    },
    { id: 'sub2', nombre: 'Subestación 2', miniatura: 'assets/miniaturas/ocho.png', carpeta: 'sub2',
      hotSpots: [
          {
              "pitch": -89.77,
              "yaw": 160.43,
              "cssClass": "custom-nadir-hotspot",
              "createTooltipFunc": nadirTooltip,
              "createTooltipArgs": "assets/marca.png",
              "scale": true
          }
      ]
    }
];

let viewer;

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    generarMiniaturas();
    iniciarVisor();
    asignarEventosGlobales();
});

// ============================================================
// LÓGICA DE UI
// ============================================================
function generarMiniaturas() {
    const contenedor = document.getElementById('thumb-container-vertical');
    if(!contenedor) return;

    // Limpiamos contenido por si algo habia en el HTML original
    contenedor.innerHTML = '';

    escenasData.forEach((escena, index) => {
        // Crear elemento de miniatura
        const button = document.createElement('button');
        button.type = 'button';
        button.id = `thumb-${escena.id}`;
        button.className = `thumb-v ${index === 0 ? 'activa' : ''}`;
        button.setAttribute('aria-label', `Ir a escena ${escena.nombre}`);
        
        button.innerHTML = `
            <img src="${escena.miniatura}" alt="Miniatura de ${escena.nombre}">
            <span>${escena.nombre}</span>
        `;
        
        // Asignar evento click
        button.addEventListener('click', () => irAEscena(escena.id));
        
        contenedor.appendChild(button);
    });
}

function asignarEventosGlobales() {
    // Menu Toggle
    const menuBtn = document.getElementById('menu-toggle');
    if(menuBtn) {
        menuBtn.addEventListener('click', toggleMenu);
    }

    // Botón de Entrar
    const btnEntrar = document.getElementById('btn-entrar');
    if(btnEntrar) {
        btnEntrar.addEventListener('click', quitarPortada);
    }
}

function quitarPortada() {
    const portada = document.getElementById('portada-bienvenida');
    if(portada) {
        portada.style.opacity = '0';
        setTimeout(() => {
            portada.style.visibility = 'hidden';
            // Remover para que no bloquee interacciones aunque sea invisible
            portada.remove();
        }, 800);
    }
}

function toggleMenu() {
    const menu = document.getElementById('side-menu');
    const btn = document.getElementById('menu-toggle');
    if(!menu || !btn) return;

    if (menu.classList.contains('menu-cerrado')) {
        menu.classList.remove('menu-cerrado');
        menu.classList.add('menu-abierto');
        btn.innerHTML = '✕';
    } else {
        menu.classList.remove('menu-abierto');
        menu.classList.add('menu-cerrado');
        btn.innerHTML = '☰';
    }
}

function irAEscena(id) {
    if (viewer) {
        viewer.loadScene(id);
        const menu = document.getElementById('side-menu');
        if (menu && menu.classList.contains('menu-abierto')) {
            toggleMenu();
        }
    }
}

function nadirTooltip(hotSpotDiv, args) {
    hotSpotDiv.classList.add('pnlm-tooltip');
    var image = document.createElement('img');
    image.src = args;
    hotSpotDiv.appendChild(image);
}

// ============================================================
// LÓGICA PANNELLUM
// ============================================================
function iniciarVisor() {
    // Primero, construir el objeto "scenes" dinámicamente desde escenasData
    const sceneConfig = {};
    
    escenasData.forEach(escena => {
        sceneConfig[escena.id] = {
            "type": "multires",
            "multiRes": {
                "basePath": `${basePathPano}/${escena.carpeta}`,
                "path": "/%l/%s%y_%x",
                "fallbackPath": "/fallback/%s",
                "extension": "jpg",
                "tileResolution": 512,
                "maxLevel": 4,
                "cubeResolution": 3816
            }
        };

        if (escena.hotSpots) {
            sceneConfig[escena.id].hotSpots = escena.hotSpots;
        }
    });

    viewer = pannellum.viewer('panorama', {
        "default": {
            "firstScene": "fachada",
            "compass": false,
            "sceneFadeDuration": 1500,
            "autoLoad": true,
            "autoRotate": 0,
            "hfov": 100,
            "friction": 0.15,
            "showControls": false
        },
        "scenes": sceneConfig
    });

    // Eventos de la vista
    viewer.on('scenechange', function (sceneId) {
        // Actualizar miniaturas
        document.querySelectorAll('.thumb-v').forEach(t => t.classList.remove('activa'));
        const activeThumb = document.getElementById('thumb-' + sceneId);
        
        if (activeThumb) {
            activeThumb.classList.add('activa');
            const spanTexto = activeThumb.querySelector('span');
            if(spanTexto) {
                const nombreEscena = spanTexto.innerText;
                const contenedor = document.getElementById('texto-escena-dinamico');
                
                if (contenedor) {
                    contenedor.innerText = nombreEscena;
                    // Forzar reinicio de animación
                    contenedor.classList.remove('animar-titulo');
                    void contenedor.offsetWidth; 
                    contenedor.classList.add('animar-titulo');
                }
            }
        }
    });

    viewer.on('mousedown', function (event) {
        var coords = viewer.mouseEventToCoords(event);
        console.log("COORDENADAS DETECTADAS: Pitch: " + coords[0].toFixed(2) + " | Yaw: " + coords[1].toFixed(2));
    });
}
