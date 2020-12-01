varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float lensRadius1;
uniform float lensRadius2;
uniform float lensDiameter;
uniform float lensWidth;
uniform vec3 lensPosition;
uniform float eta[6];
uniform vec2 screen;

vec4 raycirc(vec3 orig,vec3 ray,vec3 center,float radius){
    float r2=radius*radius;
    vec3 L=center-orig;
    float tca=dot(L,ray);
    float d2=dot(L,L)-tca*tca;
    float d=sqrt(d2);
    if(d>radius){
        // Miss the lens
        return vec4(0,0,0,0);
    }
    float thc=sqrt(r2-d2);
    return vec4(orig+(tca-thc)*ray,1);
}

vec3 rayplane(vec3 orig,vec3 ray,float wallZ){
    vec3 p0=vec3(0,0,wallZ);
    vec3 l0=orig;
    vec3 n=vec3(0,0,-1);
    float d=(p0-l0).z/ray.z;
    // float d = dot(p0 - l0, n) / dot(ray, n);
    return orig+ray*d;
}

void main(){
    float wallZ=gl_FragCoord.z;
    float tmp1=sqrt(lensRadius1*lensRadius1-lensDiameter*lensDiameter/4.);
    vec3 lensCenter1=lensPosition+vec3(0,0,lensWidth/2.+tmp1);
    float tmp2=sqrt(lensRadius2*lensRadius2-lensDiameter*lensDiameter/4.);
    vec3 lensCenter2=lensPosition+vec3(0,0,lensWidth/2.-tmp2);
    
    vec3 ray=normalize(gl_FragCoord.xyz);
    
    vec4 intersection1=raycirc(vec3(0,0,0),ray,lensCenter1,lensRadius1);
    vec3 normal1=normalize(intersection1.xyz-lensCenter1);
    
    // float eta[6] = float[6]{1.15, 1.17, 1.19, 1.21, 1.23, 1.25};
    vec3 colors[6];
    float eta_i;
    vec3 ray2,normal2,ray3,intersection3;
    vec4 intersection2;
    
    #pragma unroll_loop_start
    for(int i=0;i<6;i++){
        eta_i=eta[i];
        ray2=refract(ray,normal1,1./eta_i);
        
        intersection2=raycirc(intersection1.xyz,ray2,lensCenter2,lensRadius2);
        normal2=normalize(intersection2.xyz-lensCenter2);
        
        ray3=refract(ray,normal2,eta_i);
        
        intersection3=rayplane(intersection2.xyz,ray3,wallZ);
        
        colors[i]=texture2D(tDiffuse,intersection3.xy/screen.xy).rgb;
    }
    #pragma unroll_loop_end
    
    float r=colors[0].r*.5;
    float y=dot(vec3(2.,2.,-1.),colors[1])/6.;
    float g=colors[2].g*.5;
    float c=dot(vec3(-1.,2.,2.),colors[3])/6.;
    float b=colors[4].b*.5;
    float v=dot(vec3(2.,-1.,2.),colors[5])/6.;
    
    float R=r+(2.*v+2.*y-c)/3.;
    float G=g+(2.*y+2.*c-v)/3.;
    float B=b+(2.*c+2.*v-y)/3.;
    
    gl_FragColor.a=intersection1.a*intersection2.a;
    gl_FragColor.rgb=vec3(R,G,B);
}