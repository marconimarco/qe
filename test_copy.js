const messages = [
  { role: 'model', text: "Hello\n```python\nimport numpy\nprint(1)\n```" }
];
const fullInterviewText = messages.map(m => {
  const sender = m.role === 'model' ? 'Solution Architect AI' : 'Utente';
  return `[${sender}]\n${m.text}\n`;
}).join('\n----------------------------------------\n\n');
console.log(fullInterviewText);
