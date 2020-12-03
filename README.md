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

The simplest way is to use the python builtin http server 

```bash
   # In the root of this project folder run
   python -m http.server
```


## Workload Breakdown
| Name               | Contribution                                 | Percentage |
| ------------------ |:---------------------------------------------|:---------- |
| Anshuman Medhi     | Writina debugging the lens fragment shader   | 50%        |
| Aaron Si-yuan Wang | Controls, UI and Scene, Debugging the Shader | 50%        |

Lens Parameters:

- Radius of curvature of each surface
- Diameter of lens
- Thickness of glass
- Position of lens (XYZ)
- Rotation of lens


## Major Technical Challenges

The whole project is rendered using multiple passes (one for each lens), this is set up in `app.js` so that first the scene is rendered, then each lens distorts the scene, outputting a new texture that is fed to the next lens.

The lens distortion fragment shader (`shaders/lens.frag.glsl`) uses a restricted form of raytracing to simulate how the path of light to the camera is distorted by refraction through the lens, including different refractive indices for the different color components of light.

## Libraries Used

| Library       | Link                                |
| -------       |:----------------------------------- |
| ThreeJS       | https://github.com/mrdoob/three.js/ |
| dat.gui       | https://github.com/dataarts/dat.gui |
| OrbitControls | https://threejs.org/docs/#examples/en/controls/OrbitControls |
| DragControls  | https://threejs.org/docs/#examples/en/controls/DragControls |
| Stats         | https://github.com/mrdoob/stats.js/ |
