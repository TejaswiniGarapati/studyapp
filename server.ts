import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper for fallback AI planner when API key is missing or offline
function generateRuleBasedPlan(prompt: string, schedule: any[], profile: any, tasks: any[]) {
  const isExamUrgent = prompt.toLowerCase().includes('exam') || prompt.toLowerCase().includes('test');
  const missedDSA = prompt.toLowerCase().includes('dsa') || prompt.toLowerCase().includes('missed');
  const needsChores = prompt.toLowerCase().includes('clothes') || prompt.toLowerCase().includes('chore') || prompt.toLowerCase().includes('cleaning');

  const lunchTime = profile?.lunchTime || '13:30';
  const dinnerTime = profile?.dinnerTime || '17:30';
  const sleepTime = profile?.sleepTime || '23:00';
  const wakeTime = profile?.wakeTime || '06:30';

  const proposedSchedule = [
    {
      id: 'plan-1',
      title: 'Morning Routine & Healthy Breakfast',
      category: 'Meals',
      startTime: wakeTime,
      endTime: '07:15',
      priority: 'Medium',
      notes: 'Preserved healthy morning start',
      dayOfWeek: 'Today',
      isFixed: true,
    },
    {
      id: 'plan-2',
      title: isExamUrgent ? 'Urgent Exam Revision & Core Formula Review' : 'Focused GATE / College Prep',
      category: isExamUrgent ? 'Exams' : 'GATE',
      startTime: '07:15',
      endTime: '08:45',
      priority: 'Urgent',
      notes: isExamUrgent ? 'Dedicated morning revision block for upcoming examination' : 'High energy study block',
      dayOfWeek: 'Today',
      isFixed: false,
    },
    {
      id: 'plan-3',
      title: 'College Lectures & Academic Work',
      category: 'College',
      startTime: '09:00',
      endTime: '13:00',
      priority: 'High',
      notes: 'Fixed college commitment',
      dayOfWeek: 'Today',
      isFixed: true,
    },
    {
      id: 'plan-4',
      title: 'Lunch & Screen-free Rest',
      category: 'Meals',
      startTime: lunchTime,
      endTime: '14:15',
      priority: 'High',
      notes: 'Protected meal time for sustained energy',
      dayOfWeek: 'Today',
      isFixed: true,
    },
    {
      id: 'plan-5',
      title: missedDSA ? 'Recovered DSA Session (Problem Solving & Abdul Bari Notes)' : 'Targeted Technical Learning',
      category: 'DSA',
      startTime: '14:30',
      endTime: '16:00',
      priority: 'High',
      notes: 'Recovering missed DSA practice without compromising evening commitments',
      dayOfWeek: 'Today',
      isFixed: false,
    },
    {
      id: 'plan-6',
      title: needsChores ? 'Household Chores (Washing Clothes & Cleaning)' : 'Active Break / Quick Chores',
      category: 'Household Chores',
      startTime: '16:15',
      endTime: '17:15',
      priority: 'Medium',
      notes: 'Dedicated chore block to clear mental space',
      dayOfWeek: 'Today',
      isFixed: false,
    },
    {
      id: 'plan-7',
      title: 'Dinner & Relaxation',
      category: 'Meals',
      startTime: dinnerTime,
      endTime: '18:15',
      priority: 'High',
      notes: 'Protected dinner with family',
      dayOfWeek: 'Today',
      isFixed: true,
    },
    {
      id: 'plan-8',
      title: isExamUrgent ? 'Final Exam Mock Questions & High-Yield Summary' : 'First Labs Placement Prep & Coding',
      category: isExamUrgent ? 'Exams' : 'Placements',
      startTime: '18:30',
      endTime: '20:15',
      priority: 'Urgent',
      notes: isExamUrgent ? 'Final revision pass before tomorrow' : 'Mock technical interview and coding round preparation',
      dayOfWeek: 'Today',
      isFixed: false,
    },
    {
      id: 'plan-9',
      title: 'Light Review, CS50 Concept Recap & Pack Bag',
      category: 'Coding',
      startTime: '20:30',
      endTime: '21:45',
      priority: 'Medium',
      notes: 'Low-stress recap before night wind-down',
      dayOfWeek: 'Today',
      isFixed: false,
    },
    {
      id: 'plan-10',
      title: 'Night Wind-down (No Screens & Relax)',
      category: 'Personal',
      startTime: '22:00',
      endTime: sleepTime,
      priority: 'High',
      notes: 'Wind-down routine to ensure restful sleep',
      dayOfWeek: 'Today',
      isFixed: true,
    },
    {
      id: 'plan-11',
      title: 'Restful Sleep (7.5 Hours Rest)',
      category: 'Sleep',
      startTime: sleepTime,
      endTime: wakeTime,
      priority: 'Urgent',
      notes: 'Completely preserved sleep for exam alertness',
      dayOfWeek: 'Today',
      isFixed: true,
    },
  ];

  return {
    summary: `Balanced schedule optimized for: "${prompt.slice(0, 100)}...". Preserved meal times (lunch at ${lunchTime}, dinner at ${dinnerTime}), household responsibilities, and guaranteed 7.5 hours of sleep from ${sleepTime} to ${wakeTime}.`,
    movedActivities: [
      'Shifted intensive study to morning and post-lunch blocks.',
      'Protected 1 hour for laundry and household chores before dinner.',
      'Prioritized urgent examination prep while recovering DSA practice.',
      `Locked sleep schedule (${sleepTime} to ${wakeTime}) so you stay alert tomorrow.`,
    ],
    proposedSchedule,
    advice: 'Drink water regularly and take a 5-minute breather between blocks. You do not have to be perfect; completing 80% with good sleep is a massive victory!',
  };
}

// Fallback chat assistant
function generateRuleBasedChat(message: string, context: any) {
  const lower = message.toLowerCase();
  if (lower.includes('gate') && lower.includes('placement')) {
    return `### Balancing GATE 2027 and Placements

Here is a proven 3-pillar strategy for balancing both:

1. **Morning Core Focus (GATE Theory & Math)**:
   - Dedicate 75–90 minutes in the morning (e.g. 07:15 - 08:30) to Engineering Mathematics or Theory of Computation. Your brain is freshest for abstract reasoning.

2. **Afternoon / Evening Applied Skill (DSA & Placements)**:
   - After college and lunch (14:30 - 16:00), practice 2 LeetCode medium problems or Abdul Bari algorithm concepts. DSA overlaps directly between placement coding rounds and GATE algorithms!

3. **Weekend Full-Length Mocks & Projects**:
   - Use Saturday for your **MoneyWise** project sprint or First Labs mock interviews.
   - Use Sunday morning for a timed GATE topic test.

*Remember: Consistency of 4.5 focused hours beats 10 scattered hours.*`;
  }

  if (lower.includes('exam in') || lower.includes('revision plan')) {
    return `### 5-Day Exam Revision Blueprint

- **Day 1 (Concept Mapping)**: Review high-yield notes, syllabus checklist, and mark difficult topics.
- **Day 2 (Previous Year Questions - PYQs)**: Solve at least 3 years of past papers under timed conditions.
- **Day 3 (Weak Spots & Formulas)**: Deep dive into the questions you got wrong on Day 2. Make 1-page formula cheatsheets.
- **Day 4 (Full Mock Simulation)**: Write a timed exam simulation matching actual exam hours.
- **Day 5 (Light Recap & Rest)**: No new topics! Review formula sheet, pack stationery and admit card, and sleep by 10:30 PM.

Would you like me to reschedule your timetable for the next 5 days? Head to the **AI Planner** tab to generate a custom timetable!`;
  }

  if (lower.includes('missed') || lower.includes('rearrange') || lower.includes('rebalance')) {
    return `Don't worry about missing tasks! Progress is not a straight line.

Here is the quick rescue protocol:
1. **Drop low-priority filler**: Move non-urgent readings to the weekend.
2. **Combine tasks**: Listen to a CS50 lecture while folding laundry or doing chores.
3. **Protect sleep**: Never cut sleep below 7 hours to make up for daytime delays; sleep debt kills tomorrow's performance.

Head over to the **AI Planner** and tap **"Rebalance Today's Schedule"** to get a freshly optimized timetable you can preview and approve!`;
  }

  return `Hello! I'm your **FocusMate AI** companion.

I can help you:
- **Balance GATE 2027, placements, and college coursework**
- **Reorganize today's schedule** when life happens or chores pile up
- **Design revision timelines** for upcoming exams
- **Structure DSA practice sessions** (Arrays, Trees, Graphs, DP)

What is your top focus area today?`;
}

// API Routes
app.post('/api/gemini/plan', async (req, res) => {
  try {
    const { prompt, schedule, profile, tasks, exams } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      // Graceful offline fallback
      const plan = generateRuleBasedPlan(prompt, schedule, profile, tasks);
      return res.json({ success: true, plan, source: 'fallback-rules' });
    }

    const systemInstruction = `You are FocusMate AI, an expert student life-balance and academic scheduling system.
The student needs to balance college, GATE exams, placement preparation (e.g. First Labs, DSA, Java, Python), coursework, household chores (cleaning, washing clothes), meals (Lunch at ${profile?.lunchTime || '13:30'}, Dinner at ${profile?.dinnerTime || '17:30'}), and healthy sleep (${profile?.sleepTime || '23:00'} to ${profile?.wakeTime || '06:30'}).

CRITICAL RULES:
1. NEVER delete or ignore meals (${profile?.lunchTime || '13:30'} lunch, ${profile?.dinnerTime || '17:30'} dinner) or sleep (${profile?.sleepTime || '23:00'} to ${profile?.wakeTime || '06:30'}).
2. Identify fixed commitments (like college hours, exam slots, meals, sleep).
3. Accommodate the student's request (e.g. recovering missed DSA, washing clothes, preparing for imminent exam) in realistic, non-overlapping free time blocks.
4. Explain clearly what was moved and why.
5. Provide encouraging, realistic, non-judgmental student advice.
6. Return structured JSON with:
   - summary: concise description of the new plan
   - movedActivities: array of strings explaining adjustments
   - proposedSchedule: array of activity objects { id, title, category, startTime (HH:MM), endTime (HH:MM), priority ('Urgent'|'High'|'Medium'|'Low'), notes, dayOfWeek, isFixed }
   - advice: compassionate, actionable student tip`;

    const promptText = `Student Request: "${prompt}"

Current Profile & Fixed Times:
- Lunch: ${profile?.lunchTime || '13:30'}
- Dinner: ${profile?.dinnerTime || '17:30'}
- Sleep: ${profile?.sleepTime || '23:00'} to ${profile?.wakeTime || '06:30'}
- College / Academic Hours: ${profile?.collegeHours || '09:00 - 13:00'}

Upcoming Tasks / Exams Context:
- Tasks: ${JSON.stringify(tasks?.slice(0, 5) || [])}
- Upcoming Exams: ${JSON.stringify(exams?.map((e: any) => ({ name: e.name, date: e.date })) || [])}

Existing Today Schedule:
${JSON.stringify(schedule || [])}

Generate a revised, realistic, balanced schedule that accommodates this request without breaking sleep or meals.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            movedActivities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            proposedSchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  dayOfWeek: { type: Type.STRING },
                  isFixed: { type: Type.BOOLEAN },
                },
                required: ['id', 'title', 'category', 'startTime', 'endTime', 'priority'],
              },
            },
            advice: { type: Type.STRING },
          },
          required: ['summary', 'movedActivities', 'proposedSchedule', 'advice'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, plan: parsed, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Gemini Plan Error:', error);
    // Graceful fallback if API fails
    const plan = generateRuleBasedPlan(req.body.prompt || '', req.body.schedule || [], req.body.profile || {}, req.body.tasks || []);
    return res.json({ success: true, plan, source: 'fallback-rules', warning: error?.message });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      const reply = generateRuleBasedChat(message, context);
      return res.json({ success: true, reply, source: 'fallback-rules' });
    }

    const systemInstruction = `You are FocusMate AI, a compassionate, hyper-competent student productivity and life coach.
The student is preparing for competitive exams like GATE 2027, campus placements (First Labs), university exams, CS learning (Abdul Bari DSA, CS50, Java, Python, Networking, SysAdmin), and side projects (MoneyWise), while managing household chores (laundry, room cleaning), meals, and healthy sleep.

Guidelines:
- Tone: Warm, encouraging, non-judgmental, practical, structured.
- Always respect student wellbeing, sleep (minimum 7h), and meal breaks.
- When answering questions like "Balance GATE and placement", "Plan my day", or "I missed three tasks", give clear actionable bullet points with realistic time estimates.
- Use clean Markdown with headers and bullet points.`;

    const chatContext = `Current Student Context:
- Name: ${context?.profile?.name || 'Student'}
- Level: ${context?.profile?.educationLevel || 'B.Tech Final Year'}
- College: ${context?.profile?.collegeHours || '09:00 - 13:00'}
- Key Exams: ${JSON.stringify(context?.exams?.map((e: any) => e.name) || [])}
- Pending High Priority Tasks: ${JSON.stringify(context?.tasks?.filter((t: any) => !t.completed && (t.priority === 'Urgent' || t.priority === 'High')).map((t: any) => t.title) || [])}`;

    const prompt = `${chatContext}\n\nStudent Message: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || generateRuleBasedChat(message, context);
    return res.json({ success: true, reply, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    const reply = generateRuleBasedChat(req.body.message || '', req.body.context || {});
    return res.json({ success: true, reply, source: 'fallback-rules' });
  }
});

// Mount Vite or serve static files
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FOCUSMATE server running on http://0.0.0.0:${PORT}`);
  });
}

start();
