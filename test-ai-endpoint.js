const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEndpoint() {
  try {
    // First, let's find a project and card to test with
    const project = await prisma.project.findFirst({
      include: {
        cards: {
          where: {
            isAiAllowedTask: true,
            status: 'READY'
          },
          take: 1
        }
      }
    });

    if (!project) {
      console.log('No projects found in database');
      return;
    }

    console.log('Found project:', project.id, project.name);

    if (project.cards.length === 0) {
      console.log('No AI-allowed READY cards found in this project');
      return;
    }

    const card = project.cards[0];
    console.log('Found card:', card.id, card.title);

    // Now test the update_status endpoint
    console.log('\nTesting update_status endpoint...');
    
    const payload = {
      action: 'update_status',
      projectId: project.id,
      cardId: card.id,
      status: 'IN_PROGRESS',
      comment: 'Testing the update_status endpoint'
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('http://localhost:3000/api/ai/issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();
    console.log('\nResponse status:', response.status);
    console.log('Response data:', JSON.stringify(responseData, null, 2));

    // Test with invalid payload
    console.log('\n\nTesting with missing projectId...');
    const invalidPayload = {
      action: 'update_status',
      cardId: card.id,
      status: 'IN_PROGRESS'
    };

    const invalidResponse = await fetch('http://localhost:3000/api/ai/issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidPayload)
    });

    const invalidData = await invalidResponse.json();
    console.log('Invalid response status:', invalidResponse.status);
    console.log('Invalid response data:', JSON.stringify(invalidData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEndpoint();