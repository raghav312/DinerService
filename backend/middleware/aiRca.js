const { AIProjectClient } = require("@azure/ai-projects");
const { DefaultAzureCredential } = require("@azure/identity");

const PROJECT_ENDPOINT = "https://fhlproject.services.ai.azure.com/api/projects/fhlproject-project";
const ASSISTANT_ID = "asst_q03MhiGnRkIZQXkLLjtWnHlF";

async function triggerRca(errorLog) {
  try {
    const project = new AIProjectClient(PROJECT_ENDPOINT, new DefaultAzureCredential());
    const agent = await project.agents.getAgent(ASSISTANT_ID);
    const thread = await project.agents.threads.create();

    const messageContent =
      `RCA request for error log:\n` +
      `Error: ${errorLog.error}\n` +
      `Action: ${errorLog.action}\n` +
      `Table: ${errorLog.table}\n` +
      `Timestamp: ${errorLog.timestamp}\n` +
      `Data: ${JSON.stringify(errorLog.data)}\n` +
      `UserAgent: ${errorLog.userAgent}`;

    await project.agents.messages.create(thread.id, "user", messageContent);

    let run = await project.agents.runs.create(thread.id, agent.id);
    while (run.status === "queued" || run.status === "in_progress") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await project.agents.runs.get(thread.id, run.id);
    }

    if (run.status === "failed") {
      return { rcaError: run.lastError };
    }

    const messages = project.agents.messages.list(thread.id, { order: "asc" });
    let rcaResponse = null;
    for await (const m of messages) {
      console.log("AI RCA DEBUG - Message:", JSON.stringify(m, null, 2));
      const content = m.content.find((c) => c.type === "text" && "text" in c);
      if (content && m.role === "assistant") {
        rcaResponse = content.text.value;
      }
    }
    console.log("AI RCA DEBUG - RCA Response:", rcaResponse);
    return rcaResponse || { rcaError: "No assistant message found" };

  } catch (err) {
    return { rcaError: err.toString() };
  }
}

module.exports = { triggerRca };
