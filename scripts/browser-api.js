async page => {
 const results = await page.evaluate(async () => {
  const post = async (path, body) => { const response = await fetch(path, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)}); return {status:response.status, body:await response.json()}; };
  const execution = await post('/api/coding/execute', {language:'python', code:'print(1)'});
  const invalidReview = await post('/api/coding/review', {language:'unknown'});
  const form = new FormData(); form.append('file', new File(['not a PDF'], 'invalid.pdf', {type:'application/pdf'}));
  const badPdf = await fetch('/api/resume/parse', {method:'POST', body:form});
  const created = await post('/api/vapi/generate', {role:'QA practice session', level:'placement', techstack:['Electronics'], type:'technical', amount:3, userId:'forged-user', questions:['Explain Ohms law.', 'What is a transistor?', 'Describe a low-pass filter.']});
  return {execution:execution.status, invalidReview:invalidReview.status, invalidPdf:badPdf.status, createdStatus:created.status, interviewId:created.body.interviewId};
 });
 if(results.execution!==503 || results.invalidReview!==400 || results.invalidPdf!==400 || results.createdStatus!==200) throw new Error(JSON.stringify(results));
 await page.goto('http://127.0.0.1:3100/interview/'+results.interviewId, {waitUntil:'domcontentloaded'});
 await page.screenshot({path:'docs/qa/interview-created-375.png',fullPage:true});
 return results;
}
