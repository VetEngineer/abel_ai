
// Native fetch (Node 18+)

async function run() {
    console.log('Starting Phase 4 (Creation Agents) Verification...');

    const endpoint = 'http://localhost:3000/api/workflows';

    const payload = {
        projectId: 'verify-phase4-creation-' + Date.now(),
        contentId: 'content-' + Date.now(),
        topic: 'Sustainable Home Gardening',
        industry: 'Lifestyle',
        targetAudience: 'Beginners',
        brandVoice: 'Friendly and encouraging',
        userId: 'test-user-phase4-creation'
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
        while (attempts < 90) { // Poll for up to 3 minutes (content writing takes time)
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

            // Check for Creation agents
            const copywriting = workflow.agent_executions.find(e => e.agent_type === 'copywriting');
            const contentWriting = workflow.agent_executions.find(e => e.agent_type === 'content_writing');
            const answerOptimization = workflow.agent_executions.find(e => e.agent_type === 'answer_optimization');

            if (copywriting) console.log('Copywriting:', copywriting.status);
            if (contentWriting) console.log('Content Writing:', contentWriting.status);
            if (answerOptimization) console.log('Answer Optimization:', answerOptimization.status);

            if (copywriting?.status === 'completed' &&
                contentWriting?.status === 'completed' &&
                answerOptimization?.status === 'completed') {
                console.log('SUCCESS: All Creation Agents completed!');

                if (copywriting.tokens_used > 0) console.log('Copywriting Tokens:', copywriting.tokens_used);
                if (contentWriting.tokens_used > 0) console.log('Content Writing Tokens:', contentWriting.tokens_used);
                if (answerOptimization.tokens_used > 0) console.log('Answer Optimization Tokens:', answerOptimization.tokens_used);

                break;
            }

            if (workflow.status === 'failed') {
                console.error('Workflow Failed:', workflow.error);
                break;
            }

            if (workflow.status === 'completed') {
                console.log('Workflow Completed fully.');
                break;
            }
        }

    } catch (err) {
        console.error('Verification Failed:', err);
        process.exit(1);
    }
}

run();
