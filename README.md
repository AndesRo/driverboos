<div align="center">

# 📦 DriverBoos

**Aplicación web para conductores — gestión de órdenes de entrega, control de rutas y reportes financieros**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[![React Router](https://img.shields.io/badge/React_Router-6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Node.js](https://img.shields.io/badge/Node.js-≥18-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

Aplicación desarrollada para conductores de reparto, que permite registrar órdenes de entrega, controlar rutas y generar reportes financieros con retención del **15.25%**. Construida con **React + Vite + Tailwind CSS** en el frontend y **Supabase** como backend.

</div>

---

## 📑 Tabla de contenidos

- [Características](#-características)
- [Stack tecnológico](#️-stack-tecnológico)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y configuración](#️-instalación-y-configuración)
- [Uso de la aplicación](#-uso-de-la-aplicación)
- [Seguridad](#-seguridad)
- [Roadmap](#-roadmap)
- [Contribución](#-contribución)
- [Licencia](#-licencia)
- [Autor](#-autor)

---

## ✨ Características

| Categoría                | Detalle                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 🔐 Autenticación         | Registro e inicio de sesión con email/contraseña vía Supabase Auth                                           |
| 🔒 Datos por usuario     | Cada conductor ve solo sus propias órdenes mediante políticas **RLS** en Supabase                            |
| 📝 Registro de órdenes   | Número de orden, comuna (con tarifa automática), ruta (especial para Las Condes: 1, 2, 3, K), fecha y estado |
| 📋 Listado diario        | Filtro por fecha, resumen de entregados / parciales / no entregados, total bruto                             |
| ✏️ Edición y eliminación | Gestión completa de órdenes ya registradas                                                                   |
| 📊 Reporte financiero    | Filtro por rango de fechas, cálculo de retención (15.25%) y neto                                             |
| 📁 Exportación           | A **Excel (.xlsx)** y **PDF** con tabla detallada                                                            |
| 📱 Diseño responsive     | Interfaz accesible, con temática _dark orange_ moderno                                                       |
| 🖼️ SEO & Open Graph      | Imagen y descripción optimizadas al compartir en redes sociales                                              |

---

## 🛠️ Stack tecnológico

**Frontend**

![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)

**Backend**

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

**Librerías clave**

| Paquete                     | Uso                                                       |
| --------------------------- | --------------------------------------------------------- |
| `@supabase/supabase-js`     | Cliente para autenticación y consultas a la base de datos |
| `xlsx`                      | Exportación de reportes a Excel                           |
| `jspdf` + `jspdf-autotable` | Generación de reportes en PDF con tablas                  |

**Despliegue**

![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)

---

## 📋 Requisitos previos

- **Node.js** v18 o superior, y **npm**
- Cuenta en **[Supabase](https://supabase.com/)** (plan gratuito)
- Cuenta en **GitHub** y **[Vercel](https://vercel.com/)** para el despliegue

---

## ⚙️ Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/driver-jumbo.git
cd driver-jumbo
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

### 4. Configurar Supabase

#### a) Crear tablas y políticas RLS

Ejecuta el siguiente SQL en el **SQL Editor** de Supabase:

```sql
-- Tabla de tarifas por comuna
CREATE TABLE tarifas (
    comuna TEXT PRIMARY KEY,
    monto_bruto INTEGER NOT NULL
);

-- Insertar tarifas
INSERT INTO tarifas (comuna, monto_bruto) VALUES
    ('LAS CONDES', 3932),
    ('LA REINA', 3510),
    ('VITACURA', 4610),
    ('NUNOA', 3957),
    ('PEÑALOLÉN', 4057),
    ('SANTIAGO', 4257),
    ('LO BARNECHEA', 5110),
    ('MACUL', 4310),
    ('RECOLETA', 5212),
    ('PUENTE ALTO', 8962),
    ('PROVIDENCIA', 4257);

-- Tabla de órdenes
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL,
    comuna TEXT NOT NULL REFERENCES tarifas(comuna),
    monto_bruto INTEGER NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    ruta TEXT,
    estado TEXT DEFAULT 'entregado'
        CHECK (estado IN ('entregado', 'parcial', 'no_entregado')),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Activar Row Level Security
ALTER TABLE tarifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para tarifas
CREATE POLICY "Todos pueden leer tarifas"
    ON tarifas FOR SELECT USING (true);

-- Políticas para orders (cada usuario ve y modifica solo sus propias órdenes)
CREATE POLICY "Usuarios pueden ver sus órdenes"
    ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus órdenes"
    ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus órdenes"
    ON orders FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus órdenes"
    ON orders FOR DELETE USING (auth.uid() = user_id);
```

### 5. Levantar el proyecto en desarrollo

```bash
npm run dev
```

---

## 🧑‍💻 Uso de la aplicación

### Registro / Login

1. Crea una cuenta con email y contraseña (mínimo 6 caracteres).
2. Recibirás un correo de confirmación (si está habilitado). Haz clic en el enlace para activar tu cuenta.

### Registrar una orden

1. Selecciona la **comuna** — el monto bruto se calcula automáticamente.
2. Si la comuna es **Las Condes**, se mostrarán las opciones de ruta: `1`, `2`, `3`, `K`.
3. Para otras comunas, el campo ruta queda deshabilitado como "Sin ruta" (editable manualmente si es necesario).
4. Completa número de orden, fecha y estado.
5. Haz clic en **Guardar**.

### Listado de órdenes

- Filtra por fecha para ver las órdenes de ese día.
- Edita o elimina cualquier orden registrada.
- Consulta el resumen de entregados, parciales y no entregados, junto al total bruto.

### Reporte financiero

- Selecciona un rango de fechas (o déjalo vacío para ver todas).
- Se muestra el total bruto, la retención (**15.25%**) y el neto.
- Exporta el detalle a **Excel** o **PDF**.

---

## 🔒 Seguridad

- Cada usuario solo puede ver y gestionar sus propias órdenes gracias a las políticas **RLS** de Supabase.
- Las contraseñas se manejan de forma segura mediante **Supabase Auth**.
- Las variables de entorno protegen las claves de API y nunca se exponen en el repositorio.

---

## 🗺️ Roadmap

- [ ] Panel de administración para gestión de tarifas
- [ ] Notificaciones push para nuevas órdenes
- [ ] Historial de reportes exportados
- [ ] Modo offline (PWA)

---

## 🤝 Contribución

Si deseas mejorar la app:

1. Haz un **fork** del repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'Agrega nueva funcionalidad'`)
4. Envía un **pull request**

Para reportar errores, abre un [issue](../../issues) en GitHub.

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.

© Andrés Romero

---

## 👤 Autor

**Andrés Romero** (AndesRo)

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/andespart-ar)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:andespart.ar@gmail.com)

<div align="center">
<sub>Hecho con ❤️ en Santiago, Chile</sub>
</div>
