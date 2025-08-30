import React from 'react';
import { Composition, Sequence } from 'remotion';
import { 
  AnimatedText, 
  ProgressBar, 
  CalloutBox, 
  CountUp, 
  StatBlock,
  BarChart,
  LineChart 
} from '../ui-components';

const UIShowcase: React.FC = () => {
  // Sample data for demonstrations
  const chartData = [
    { label: 'Q1', value: 45 },
    { label: 'Q2', value: 67 },
    { label: 'Q3', value: 89 },
    { label: 'Q4', value: 92 }
  ];

  const lineData = [
    { x: 1, y: 10, label: 'Jan' },
    { x: 2, y: 25, label: 'Feb' },
    { x: 3, y: 15, label: 'Mar' },
    { x: 4, y: 40, label: 'Apr' },
    { x: 5, y: 55, label: 'May' },
  ];

  const stats = [
    { label: 'Revenue', value: 2500000, format: 'currency' as const, color: '#10b981' },
    { label: 'Growth', value: 34.5, format: 'percentage' as const, color: '#3b82f6' },
    { label: 'Users', value: 125000, format: 'number' as const, color: '#8b5cf6' },
    { label: 'Rating', value: 4.9, suffix: '/5', color: '#f59e0b' }
  ];

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#f8fafc',
      position: 'relative'
    }}>
      {/* Title Sequence */}
      <Sequence from={0} durationInFrames={120}>
        <div style={{ 
          position: 'absolute',
          top: '10%',
          width: '100%',
          textAlign: 'center'
        }}>
          <AnimatedText
            text="UI Components Showcase"
            fontSize={64}
            fontWeight="bold"
            color="#1f2937"
            animationType="typewriter"
            startAt={0}
            durationInFrames={80}
          />
        </div>
      </Sequence>

      {/* CountUp Demo */}
      <Sequence from={90} durationInFrames={180}>
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '10%',
          width: '35%'
        }}>
          <AnimatedText
            text="Animated Counters"
            fontSize={24}
            fontWeight="600"
            color="#374151"
            animationType="fade"
            startAt={0}
            durationInFrames={30}
          />
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            marginTop: '20px'
          }}>
            <CountUp
              to={1250000}
              format="currency"
              animationType="spring"
              startAt={30}
              fontSize={36}
              color="#10b981"
            />
            
            <CountUp
              to={87.5}
              format="percentage"
              animationType="bounce"
              startAt={60}
              fontSize={36}
              color="#3b82f6"
            />
            
            <CountUp
              to={45678}
              format="number"
              animationType="easeOut"
              startAt={90}
              fontSize={36}
              color="#8b5cf6"
            />
          </div>
        </div>
      </Sequence>

      {/* Progress Bars Demo */}
      <Sequence from={120} durationInFrames={150}>
        <div style={{
          position: 'absolute',
          top: '25%',
          right: '10%',
          width: '35%'
        }}>
          <AnimatedText
            text="Progress Indicators"
            fontSize={24}
            fontWeight="600"
            color="#374151"
            animationType="fade"
            startAt={0}
            durationInFrames={30}
          />
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '25px',
            marginTop: '30px'
          }}>
            <ProgressBar
              progress={0.75}
              label="Revenue Goal"
              fillColor="#10b981"
              animationType="spring"
              startAt={30}
              showGlow={true}
            />
            
            <ProgressBar
              progress={0.89}
              label="User Satisfaction"
              fillColor="#3b82f6"
              animationType="smooth"
              startAt={60}
              showGlow={true}
            />
            
            <ProgressBar
              progress={0.65}
              label="Market Share"
              fillColor="#f59e0b"
              animationType="stepped"
              startAt={90}
            />
          </div>
        </div>
      </Sequence>

      {/* Callout Boxes Demo */}
      <Sequence from={200} durationInFrames={150}>
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '5%',
          width: '40%'
        }}>
          <CalloutBox
            title="Key Insight"
            variant="info"
            icon="💡"
            animationType="slide"
            direction="left"
            startAt={0}
            width={500}
            height="auto"
          >
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6 }}>
              Revenue growth accelerated by <strong>34%</strong> this quarter, 
              driven by new customer acquisition and product expansion.
            </p>
          </CalloutBox>
        </div>
      </Sequence>

      <Sequence from={230} durationInFrames={150}>
        <div style={{
          position: 'absolute',
          top: '75%',
          right: '5%',
          width: '40%'
        }}>
          <CalloutBox
            title="Warning"
            variant="warning"
            icon="⚠️"
            animationType="bounce"
            startAt={0}
            width={500}
            height="auto"
          >
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6 }}>
              Customer acquisition costs increased by <strong>15%</strong>. 
              Consider optimizing marketing channels for better efficiency.
            </p>
          </CalloutBox>
        </div>
      </Sequence>

      {/* Charts Demo */}
      <Sequence from={300} durationInFrames={180}>
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '5%',
          width: '42%'
        }}>
          <BarChart
            data={chartData}
            width={600}
            height={250}
            barColor="#3b82f6"
            animationType="grow"
            staggerDelay={5}
            startAt={0}
          />
        </div>
      </Sequence>

      <Sequence from={330} durationInFrames={180}>
        <div style={{
          position: 'absolute',
          bottom: '5%',
          right: '5%',
          width: '42%'
        }}>
          <LineChart
            data={lineData}
            width={600}
            height={250}
            strokeColor="#10b981"
            fillColor="rgba(16, 185, 129, 0.1)"
            startAt={0}
            animationDuration={90}
          />
        </div>
      </Sequence>

      {/* Stats Block Demo */}
      <Sequence from={400} durationInFrames={150}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <StatBlock
            stats={stats}
            columns={2}
            width={600}
            height={250}
            title="Q4 2024 Performance"
            animationType="counter"
            staggerDelay={8}
            startAt={30}
          />
        </div>
      </Sequence>
    </div>
  );
};

export const UIComponentsShowcaseComposition = () => {
  return (
    <Composition
      id="UIComponentsShowcase"
      component={UIShowcase}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};