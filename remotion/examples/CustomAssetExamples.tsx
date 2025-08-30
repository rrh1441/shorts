/**
 * Custom Asset Segment Examples
 * Demonstrates how to create intro/outro segments with user-provided assets + TTS
 * Real-world examples for different use cases
 */

import React, { useState } from 'react';
import { Composition } from 'remotion';
import CustomAssetSegment, { IntroSegment, OutroSegment, LogoRevealSegment } from '../components/CustomAssetSegment';
import { AssetManager, AssetMetadata, CustomSegmentConfig } from '../design/AssetManager';
import AssetUploader from '../design/AssetUploader';
import { SegmentPreview, SegmentMetadata } from '../design/SegmentPreview';

// Example 1: Corporate Brand Intro
export const CorporateIntroExample: React.FC = () => {
  // Mock asset data - in real implementation, this would come from actual uploads
  const mockBrandVideo: AssetMetadata = {
    id: 'brand-video-1',
    name: 'Corporate Brand Video',
    originalName: 'brand-intro.mp4',
    type: 'video',
    format: '.mp4',
    size: 15 * 1024 * 1024, // 15MB
    duration: 5,
    dimensions: { width: 1920, height: 1080 },
    url: '/static/examples/corporate-brand.mp4', // Would be actual video URL
    thumbnail: '/static/examples/corporate-brand-thumb.jpg',
    uploadDate: new Date(),
    status: 'ready'
  };

  return (
    <IntroSegment
      asset={mockBrandVideo}
      brandName="TechCorp Solutions"
      tagline="Innovation Through Technology"
      duration={5}
      ttsScript="Welcome to TechCorp Solutions, where innovation meets technology to transform your business."
      voice="alloy"
      brandColors={{
        primary: '#0066CC',
        secondary: '#4A90E2',
        accent: '#7BB3F0'
      }}
    />
  );
};

// Example 2: Creative Agency Intro with Image
export const CreativeIntroExample: React.FC = () => {
  const mockCreativeImage: AssetMetadata = {
    id: 'creative-image-1',
    name: 'Studio Workspace',
    originalName: 'creative-studio.jpg',
    type: 'image',
    format: '.jpg',
    size: 3 * 1024 * 1024, // 3MB
    dimensions: { width: 1920, height: 1080 },
    url: '/static/examples/creative-studio.jpg',
    thumbnail: '/static/examples/creative-studio.jpg',
    uploadDate: new Date(),
    status: 'ready'
  };

  return (
    <IntroSegment
      asset={mockCreativeImage}
      brandName="PIXEL STUDIO"
      tagline="Creative Beyond Boundaries"
      duration={6}
      ttsScript="At Pixel Studio, we push creative boundaries to bring your wildest ideas to life."
      voice="nova"
      brandColors={{
        primary: '#FF6B35',
        secondary: '#F8AC8C',
        accent: '#FF8A65'
      }}
    />
  );
};

// Example 3: E-commerce Outro with Call-to-Action
export const EcommerceOutroExample: React.FC = () => {
  const mockProductVideo: AssetMetadata = {
    id: 'product-video-1',
    name: 'Product Showcase',
    originalName: 'product-showcase.mp4',
    type: 'video',
    format: '.mp4',
    size: 25 * 1024 * 1024, // 25MB
    duration: 8,
    dimensions: { width: 1920, height: 1080 },
    url: '/static/examples/product-showcase.mp4',
    thumbnail: '/static/examples/product-showcase-thumb.jpg',
    uploadDate: new Date(),
    status: 'ready'
  };

  return (
    <OutroSegment
      asset={mockProductVideo}
      callToAction="Shop Now & Save 20%"
      contact="Visit ShopNow.com | Use Code: VIDEO20"
      duration={8}
      ttsScript="Ready to upgrade your style? Visit ShopNow.com and use code VIDEO20 for twenty percent off your first order. Don't wait - this offer expires soon!"
      voice="shimmer"
      brandColors={{
        primary: '#E91E63',
        secondary: '#F8BBD9',
        accent: '#FF4081'
      }}
    />
  );
};

// Example 4: Simple Logo Reveal
export const LogoRevealExample: React.FC = () => {
  const mockLogoImage: AssetMetadata = {
    id: 'logo-1',
    name: 'Company Logo',
    originalName: 'logo-animation.gif',
    type: 'image',
    format: '.gif',
    size: 2 * 1024 * 1024, // 2MB
    dimensions: { width: 800, height: 600 },
    url: '/static/examples/animated-logo.gif',
    thumbnail: '/static/examples/animated-logo.gif',
    uploadDate: new Date(),
    status: 'ready'
  };

  return (
    <LogoRevealSegment
      asset={mockLogoImage}
      duration={3}
      ttsScript="Bringing you quality since 1995."
      voice="echo"
      brandColors={{
        primary: '#2C3E50',
        secondary: '#34495E',
        accent: '#95A5A6'
      }}
    />
  );
};

// Example 5: Custom Configuration Demo
export const CustomConfigurationExample: React.FC = () => {
  const mockAsset: AssetMetadata = {
    id: 'custom-asset-1',
    name: 'Team Meeting',
    originalName: 'team-collaboration.mp4',
    type: 'video',
    format: '.mp4',
    size: 20 * 1024 * 1024,
    duration: 12,
    dimensions: { width: 1920, height: 1080 },
    url: '/static/examples/team-meeting.mp4',
    thumbnail: '/static/examples/team-meeting-thumb.jpg',
    uploadDate: new Date(),
    status: 'ready'
  };

  const customConfig: CustomSegmentConfig = {
    id: 'custom-example-1',
    name: 'Team Introduction',
    asset: mockAsset,
    duration: 10,
    type: 'custom',
    overlay: {
      enabled: true,
      text: 'Meet Our Team\nPassionate • Innovative • Results-Driven',
      position: 'bottom',
      style: {
        backgroundColor: 'rgba(44, 62, 80, 0.9)',
        borderRadius: 12,
        padding: '20px 30px',
      }
    },
    tts: {
      script: "Meet our incredible team of passionate professionals. We're innovative problem-solvers who are dedicated to delivering exceptional results for every client.",
      voice: 'onyx',
      timing: { startTime: 2.0 },
      volume: 0.8,
      fadeIn: 0.3,
      fadeOut: 0.5
    }
  };

  return (
    <CustomAssetSegment 
      config={customConfig}
      brandColors={{
        primary: '#2C3E50',
        secondary: '#3498DB',
        accent: '#E74C3C'
      }}
      fontConfiguration={{
        title: 'Bebas Neue',
        subtitle: 'Raleway',
        body: 'Open Sans'
      }}
    />
  );
};

// Example 6: Interactive Upload Demo Component
export const InteractiveUploadDemo: React.FC = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [segments, setSegments] = useState<SegmentMetadata[]>([
    {
      id: 'example-1',
      name: 'Corporate Intro',
      duration: 5,
      description: 'Brand introduction with professional voiceover',
      component: CorporateIntroExample,
      status: 'ready',
      type: 'custom_asset'
    },
    {
      id: 'example-2',
      name: 'Creative Intro',
      duration: 6,
      description: 'Creative agency brand showcase',
      component: CreativeIntroExample,
      status: 'ready',
      type: 'custom_asset'
    },
    {
      id: 'example-3',
      name: 'E-commerce Outro',
      duration: 8,
      description: 'Product showcase with call-to-action',
      component: EcommerceOutroExample,
      status: 'ready',
      type: 'custom_asset'
    }
  ]);

  const handleAddCustomSegment = () => {
    setShowUploader(true);
  };

  const handleSegmentCreated = (config: CustomSegmentConfig) => {
    const newSegment: SegmentMetadata = {
      id: config.id,
      name: config.name,
      duration: config.duration,
      description: `Custom ${config.type} segment`,
      component: () => <CustomAssetSegment config={config} />,
      status: 'ready',
      type: 'custom_asset',
      customConfig: config
    };
    
    setSegments(prev => [...prev, newSegment]);
    setShowUploader(false);
  };

  const handleSegmentUpdate = (segmentId: string, updates: Partial<SegmentMetadata>) => {
    setSegments(prev => prev.map(segment => 
      segment.id === segmentId ? { ...segment, ...updates } : segment
    ));
  };

  const handleRenderSegment = async (segmentId: string) => {
    console.log('Rendering segment:', segmentId);
    // Simulate render process
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleSegmentSelect = (segmentId: string) => {
    console.log('Selected segment:', segmentId);
  };

  return (
    <div>
      <SegmentPreview
        segments={segments}
        onSegmentUpdate={handleSegmentUpdate}
        onRenderSegment={handleRenderSegment}
        onSegmentSelect={handleSegmentSelect}
        onAddCustomSegment={handleAddCustomSegment}
        onCustomSegmentCreated={handleSegmentCreated}
      />
      
      <AssetUploader
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onSegmentCreated={handleSegmentCreated}
      />
    </div>
  );
};

// Example 7: Remotion Compositions for Examples
export const ExampleCompositions: React.FC = () => {
  return (
    <>
      <Composition
        id="CorporateIntro"
        component={CorporateIntroExample}
        durationInFrames={5 * 30} // 5 seconds
        fps={30}
        width={1920}
        height={1080}
      />
      
      <Composition
        id="CreativeIntro"
        component={CreativeIntroExample}
        durationInFrames={6 * 30} // 6 seconds
        fps={30}
        width={1920}
        height={1080}
      />
      
      <Composition
        id="EcommerceOutro"
        component={EcommerceOutroExample}
        durationInFrames={8 * 30} // 8 seconds
        fps={30}
        width={1920}
        height={1080}
      />
      
      <Composition
        id="LogoReveal"
        component={LogoRevealExample}
        durationInFrames={3 * 30} // 3 seconds
        fps={30}
        width={1920}
        height={1080}
      />
      
      <Composition
        id="CustomConfiguration"
        component={CustomConfigurationExample}
        durationInFrames={10 * 30} // 10 seconds
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

// Usage Examples Documentation
export const USAGE_EXAMPLES = {
  basic: {
    title: "Basic Asset Upload",
    description: "Upload a video or image, add TTS narration, and create a segment",
    steps: [
      "Click 'Add Custom Asset' in segment preview",
      "Drag and drop your video/image file",
      "Choose a preset (Intro, Outro, or Logo)",
      "Add text overlay and TTS script",
      "Click 'Create Segment'"
    ]
  },
  
  intro: {
    title: "Brand Intro Segment",
    description: "Perfect for opening your videos with branded content",
    bestPractices: [
      "Use high-quality brand video or logo",
      "Keep duration between 3-5 seconds",
      "Include brand name and tagline in overlay",
      "Use professional voice (Alloy, Echo, or Onyx)",
      "Match colors to your brand palette"
    ]
  },
  
  outro: {
    title: "Call-to-Action Outro",
    description: "Drive engagement with compelling outro segments",
    bestPractices: [
      "Duration of 6-10 seconds for full message",
      "Clear call-to-action text",
      "Include contact information or website",
      "Use energetic voice (Nova or Shimmer)",
      "Position text overlay at bottom for better visibility"
    ]
  },
  
  optimization: {
    title: "Asset Optimization Tips",
    description: "Best practices for high-quality results",
    recommendations: [
      "Use 1920x1080 resolution for videos",
      "MP4 format for best compatibility",
      "Keep file sizes under 100MB",
      "High contrast images work better with text overlays",
      "Test TTS timing with actual content"
    ]
  }
};

export default {
  CorporateIntroExample,
  CreativeIntroExample,
  EcommerceOutroExample,
  LogoRevealExample,
  CustomConfigurationExample,
  InteractiveUploadDemo,
  ExampleCompositions,
  USAGE_EXAMPLES
};