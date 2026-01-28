
// Using native fetch (Node 18+)

async function run() {
    console.log('Starting Phase 3 Verification...');

    const endpoint = 'http://localhost:3000/api/workflows';

    const payload = {
        projectId: 'verify-phase3-' + Date.now(),
        contentId: 'content-' + Date.now(),
        topic: 'Sustainable Coffee Habits',
        industry: 'Food & Beverage',
        targetAudience: 'Eco-conscious consumers',
        brandVoice: 'Informative and inspiring',
        userId: 'test-user-phase3'
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
        while (attempts < 30) {
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

            // Check for Trend Keyword Agent execution
            const trendAgent = workflow.agent_executions.find(e => e.agent_type === 'trend_keyword');
            if (trendAgent) {
                console.log('Trend Keyword Agent Execution:', trendAgent);
                if (trendAgent.status === 'completed') {
                    console.log('SUCCESS: Trend Keyword Agent completed!');
                    console.log('Tokens Used:', trendAgent.tokens_used);
                    if (trendAgent.tokens_used > 0) {
                        console.log('VERIFIED: Tokens usage recorded.');
                    } else {
                        console.warn('WARNING: Tokens usage is 0. Check logging.');
                    }
                    break;
                } else if (trendAgent.status === 'error') {
                    console.error('FAILURE: Trend Keyword Agent failed:', trendAgent.error_message);
                    break;
                }
            }

            if (workflow.status === 'completed' || workflow.status === 'failed') {
                break;
            }
        }

    } catch (err) {
        console.error('Verification Failed:', err);
        process.exit(1);
    }
}

run();
