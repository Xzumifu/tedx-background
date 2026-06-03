import LiquidEther from './LiquidEther';

<div style={{ width: '100%', height: 600, position: 'relative' }}>
  <LiquidEther
    colors={[ '#5227FF', '#FF9FFC', '#B497CF' ]}
    mouseForce={12}
    cursorSize={80}
    isViscous
    viscous={30}
    iterationsViscous={32}
    iterationsPoisson={32}
    resolution={0.5}
    isBounce={false}
    autoDemo
    autoSpeed={0.5}
    autoIntensity={2.2}
    takeoverDuration={0.25}
    autoResumeDelay={3000}
    autoRampDuration={0.6}
    color0="#a67989"
    color1="#757070"
    color2="#be361a"
/>
</div>
