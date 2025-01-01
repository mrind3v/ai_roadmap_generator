import OpenAI from 'openai';
import { marked } from 'marked';

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: 'sk-5c9750a0cde34732a4dbb30bf37a0d0e',
      dangerouslyAllowBrowser: true
    });

    document.getElementById('generateBtn').addEventListener('click', async () => {
      const topic = document.getElementById('topicInput').value.trim();
      const roadmapOutput = document.getElementById('roadmapOutput');
      
      if (!topic) {
        roadmapOutput.innerHTML = `<div class="roadmap-item">Please enter a topic</div>`;
        return;
      }

      roadmapOutput.innerHTML = `<div class="loading">Generating roadmap... ⏳</div>`;

      try {
        const response = await openai.chat.completions.create({
          model: "deepseek-chat",
          messages: [{
            role: "system",
            content: `You are a helpful learning assistant. Generate a detailed learning roadmap for any given topic. Include:
            1. A motivational quote related to learning
            2. Step-by-step learning path
            3. Recommended resources (books, courses)
            4. Estimated time for each step
            5. Total time to master the skill
            Format the response in JSON with these keys: quote, steps, totalTime. Each step should have title, description, resources, and time.
            IMPORTANT: Return only the JSON object, without any markdown formatting or backticks.`
          }, {
            role: "user",
            content: `Generate a learning roadmap for: ${topic}`
          }],
          temperature: 0.7,
          max_tokens: 1000
        });

        // Clean the response if it contains markdown
        let responseContent = response.choices[0].message.content;
        responseContent = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(responseContent);
        
        let html = `<div class="quote">${marked.parse(data.quote)}</div>`;
        
        data.steps.forEach(step => {
          html += `
            <div class="roadmap-item">
              <h3>${marked.parse(step.title)}</h3>
              <p>${marked.parse(step.description)}</p>
              <ul>
                ${step.resources.map(resource => `<li>${marked.parse(resource)}</li>`).join('')}
              </ul>
              <p><strong>Time Required:</strong> ${marked.parse(step.time)}</p>
            </div>
          `;
        });

        html += `<div class="roadmap-item"><strong>Total Time to Master:</strong> ${marked.parse(data.totalTime)}</div>`;
        roadmapOutput.innerHTML = html;
      } catch (error) {
        roadmapOutput.innerHTML = `<div class="roadmap-item">Error generating roadmap: ${error.message}</div>`;
        console.error('Full error:', error);
      }
    });
