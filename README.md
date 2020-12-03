# COMP5411-Rendering-Project

## Group Information
Group Number: 21
Group Members:
| Name               | Email                 |
| ------------------ |:--------------------- |
| Anshuman Medhi     | amedhi@connect.ust.hk |
| Aaron Si-yuan Wang | aswang@connect.ust.hk |

## How to run the program

You must run a server that to serve the `index.html`, `tex/` and `shaders/` files

The simplest way is to use the python builting http server 

   # In the root of this project folder run
   python -m http.server


## Workload Breakdown
| Name               | Contribution   | Percentage |
| ------------------ |:-------------- |:---------- |
| Anshuman Medhi     | Shading        | 50%        |
| Aaron Si-yuan Wang | User Interface | 50%        |

Lens Parameters:

- Radius of curvature of each surface
- Diameter of lens
- Thickness of glass
- Position of lens (XYZ)
- Rotation of lens


## Lens Simulation Procedure

**First**
Sort the lenses so that any `X` is rendered after all the lenses that `X` can be see

**For each lens**
1. Render the scene into a texture `t = new THREE.WebGLRenderTarget` with the camera at the focal point of the Lens (calculated by `lensCenter - focalLength * lensNormal`)
2. Distort the scene texture `t` according to lens properties to get `t'`
3. Paint the scene texture `t'` onto the visible surface of the lens 
   - TODO: can we find the visible surface? or render on both surfaces and let the visibility sort itself 

**After rendering all lenses**
Render the whole scene, treating lenses as normal textured objects

## Libraries Used

| Library | Link                                |
| ------- |:----------------------------------- |
| ThreeJS | https://github.com/mrdoob/three.js/ |
| dat.gui | https://github.com/dataarts/dat.gui |
| Stats   | https://github.com/mrdoob/stats.js/ |
