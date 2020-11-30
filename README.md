# COMP5411-Rendering-Project

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