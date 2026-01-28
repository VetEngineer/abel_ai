import { VisualDesignAgent } from '@/agents/visual-design-agent';
import { MarketingFunnelAgent } from '@/agents/marketing-funnel-agent';
import { BrandSupervisionAgent } from '@/agents/brand-supervision-agent';
import { BlogDeploymentAgent } from '@/agents/blog-deployment-agent';
import { aiServiceRouter } from '@/lib/services/ai-service-router';

// Mock `ts-node` environment or similar if running directly with `node` might fail on imports.
// Since the project is TypeScript, running this with `node` will fail on imports if not compiled.
// I should check if I can run TS scripts. `scripts/verify-phase4-creation.js` was JS but used `fetch`.
// The agents are TS files. I cannot `require` TS files in Node without registration.
//
// Plan B: Use `npx ts-node` to run the script.
//
// Mock data
const mockContext = {
    userId: 'test-user-design-marketing',
    platform: 'wordpress',
    brandTone: 'professional',
    targetAudience: 'Small Business Owners',
    contentGoal: 'lead_generation',
    keywords: ['tax', 'business'] // Added required property
};

const mockContentInput = {
    content: {
        title: 'How to Save Taxes for Small Businesses',
        mainSections: [
            { title: 'Understanding Deductions', content: '...' },
            { title: 'Hiring Family Members', content: '...' }
        ],
        fullContent: 'This is a comprehensive guide about saving taxes...'
    },
    specialization: 'tax',
    topic: 'Small Business Tax Saving',
    brandVoice: 'Professional',
    targetAudience: 'Small Business Owners'
};

async function run() {
    console.log('Starting Design & Marketing Agents Verification...');

    try {
        // 1. Visual Design
        console.log('\n[1] Testing VisualDesignAgent...');
        const visualAgent = new VisualDesignAgent();
        const visualResult = await visualAgent.execute(mockContentInput, mockContext);

        if (!visualResult.success) throw new Error('VisualDesign failed: ' + visualResult.error);
        console.log('VisualDesign Success!');
        console.log('Thumbnail Concept:', visualResult.data.thumbnailDesign.concept);

        // 2. Marketing Funnel
        console.log('\n[2] Testing MarketingFunnelAgent...');
        const funnelInput = {
            ...mockContentInput,
            contentData: mockContentInput,
            copyData: { headlines: { mainHeadline: 'Save Taxes Now' } }
        };
        const funnelAgent = new MarketingFunnelAgent();
        const funnelResult = await funnelAgent.execute(funnelInput, mockContext);

        if (!funnelResult.success) throw new Error('MarketingFunnel failed: ' + funnelResult.error);
        console.log('MarketingFunnel Success!');
        console.log('Awareness Strategy:', funnelResult.data.funnelStages.awareness.content.substring(0, 50) + '...');

        // 3. Brand Supervision
        console.log('\n[3] Testing BrandSupervisionAgent...');
        const supervisionInput = {
            ...mockContentInput,
            contentData: mockContentInput,
            visualData: visualResult.data,
            funnelData: funnelResult.data
        };
        const brandAgent = new BrandSupervisionAgent();
        const brandResult = await brandAgent.execute(supervisionInput, mockContext);

        if (!brandResult.success) throw new Error('BrandSupervision failed: ' + brandResult.error);
        console.log('BrandSupervision Success!');
        console.log('Overall Score:', brandResult.data.qualityAssessment.overallScore);

        // 4. Blog Deployment
        console.log('\n[4] Testing BlogDeploymentAgent...');
        const deploymentInput = {
            approvedContent: mockContentInput,
            seoData: { metaData: { title: 'Tax Saving Tips', description: 'Save money...' } },
            visualData: visualResult.data,
            platforms: ['wordpress', 'linkedin']
        };
        const deploymentAgent = new BlogDeploymentAgent();
        const deploymentResult = await deploymentAgent.execute(deploymentInput, mockContext);

        if (!deploymentResult.success) throw new Error('BlogDeployment failed: ' + deploymentResult.error);
        console.log('BlogDeployment Success!');
        console.log('Deployment Plan Platforms:', deploymentResult.data.deploymentPlan.platforms.map((p: any) => p.platform));

        console.log('\nALL TESTS PASSED');

    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
}

run();
