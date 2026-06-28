import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className='w-full min-h-screen grid grid-cols-7'>

      {/* Left — shader gradient background, 4 cols */}
      <div className='col-span-4 hidden md:block relative'>
        <ShaderGradientCanvas
          style={{ position: 'absolute', inset: 0 }}
          pointerEvents="none"
        >
          <ShaderGradient
            animate="on"
            brightness={1}
            cAzimuthAngle={180}
            cDistance={2.8}
            cPolarAngle={80}
            cameraZoom={9.1}
            color1="#1B6E44"
            color2="#F6BE00"
            color3="#0F4429"
            envPreset="city"
            grain="on"
            lightType="3d"
            positionX={0}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0.1}
            rotationX={50}
            rotationY={0}
            rotationZ={-60}
            shader="defaults"
            type="waterPlane"
            uAmplitude={0}
            uDensity={1.5}
            uFrequency={0}
            uSpeed={0.3}
            uStrength={1.5}
            uTime={8}
            wireframe={false}
          />
        </ShaderGradientCanvas>
      </div>

      {/* Right — form, 3 cols */}
      <div className='col-span-7 md:col-span-3 flex flex-col items-center justify-center px-6 py-12'>
        <div className='w-full max-w-sm flex flex-col gap-10'>
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/assets/images/knust-logo.png"
              alt="KNUST Crest"
              className="h-14 w-auto"
            />
            <div className="pt-4 flex flex-col">
              <h1 className="font-garamond font-semibold text-xl tracking-tight m-0 leading-tight">
                KNUST
              </h1>
              <p className="text-[0.7rem] font-medium m-0 -mt-0.5 leading-normal">
                Central Energy Database
              </p>
            </div>
          </Link>

          <Outlet />

        </div>
      </div>

    </main>
  )
}