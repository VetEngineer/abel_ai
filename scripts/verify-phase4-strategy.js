
// Native fetch (Node 18+)

async function run() {
    console.log('Starting Phase 4 (Strategy Agents) Verification...');

    const endpoint = 'http://localhost:3000/api/workflows';

    const payload = {
        projectId: 'verify-phase4-strategy-' + Date.now(),
        contentId: 'content-' + Date.now(),
        topic: 'Smart Home Security Systems',
        industry: 'Technology',
        targetAudience: 'Homeowners',
        brandVoice: 'Professional and trustworthy',
        userId: 'test-user-phase4' // Ensure this matches logic
    };

    try {
        console.log('1. Starting Workflow...');
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Failed to start workflow: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Workflow Started:', data);
        const workflowId = data.workflowId;

        if (!workflowId) {
            throw new Error('No workflowId returned');
        }

        // Poll for status
        console.log(`2. Polling status for ${workflowId}...`);
        let attempts = 0;
        while (attempts < 60) { // Poll for up to 2 minutes
            await new Promise(r => setTimeout(r, 2000));
            attempts++;

            const statusRes = await fetch(`${endpoint}?workflowId=${workflowId}`);
            if (!statusRes.ok) {
                console.error('Failed to get status');
                continue;
            }
            const statusData = await statusRes.json();
            const workflow = statusData.workflow;

            if (!workflow) {
                console.log('Workflow not found yet...');
                continue;
            }

            console.log(`Attempt ${attempts}: Status=${workflow.status}, Step=${workflow.current_step}`);

            // Check for specific agents
            const contentPlanning = workflow.agent_executions.find(e => e.agent_type === 'content_planning');
            const seoOptimization = workflow.agent_executions.find(e => e.agent_type === 'seo_optimization');
            const localSeo = workflow.agent_executions.find(e => e.agent_type === 'local_seo');

            if (contentPlanning) console.log('Content Planning:', contentPlanning.status);
            if (seoOptimization) console.log('SEO Optimization:', seoOptimization.status);
            if (localSeo) console.log('Local SEO:', localSeo.status);

            // We are looking for these 3 to be completed or at least attempted
            // Note: The workflow is sequential. 
            // Trend -> Content Planning -> SEO -> Copywrite -> Content Writing -> Visual -> Local SEO
            // So Local SEO is step 7 (index 6). This might take time if we wait for all.
            // But we just want to verify they are connected.

            // If workflow fails, we check error
            if (workflow.status === 'failed') {
                console.error('Workflow Failed:', workflow.error);
                break;
            }
        }

    } catch (err) {
        console.error('Verification Failed:', err);
        process.exit(1);
    }
}

run();
