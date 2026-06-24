const PUZZLES = [
  {
    title: "Time & Place", level: "Beginner",
    entries: [
      ["in", "My birthday is ___ July.", "We use ‘in’ with months, years, seasons, and longer periods of time.", "Think about the preposition used for a whole month."],
      ["on", "The science test is ___ Monday.", "We use ‘on’ with days of the week and specific dates.", "A particular day needs a different preposition from a month."],
      ["at", "Let's meet ___ the library entrance.", "We use ‘at’ for a specific point or exact location.", "Imagine pointing to one precise spot."],
      ["from", "The café is open ___ 8 a.m. to 6 p.m.", "‘From’ marks the starting point of a period, especially in the pattern ‘from … to …’.", "The sentence gives the beginning and end of a time range."],
      ["to", "We have classes from Monday ___ Friday.", "‘To’ marks the end point in the pattern ‘from … to …’.", "Look at the word that introduces the end of a range."],
      ["before", "Please arrive ten minutes ___ the lesson begins.", "‘Before’ means earlier than a particular time or event.", "The action happens earlier, not later."],
      ["after", "We usually play football ___ school.", "‘After’ means later than a time or event.", "School finishes first; football comes next."],
      ["during", "Nobody spoke ___ the exam.", "‘During’ tells us that something happens within the period of an event.", "The silence continues inside the event's time period."],
      ["since", "She has lived here ___ 2022.", "‘Since’ gives the starting point of an action that continues to the present, often with the present perfect.", "The clue gives one starting year, not a length of time."],
      ["until", "I studied ___ midnight.", "‘Until’ means up to a particular time and then stopping or changing.", "The action continues up to an end point."],
      ["by", "Please finish the project ___ Friday.", "‘By’ sets a deadline: the action must happen no later than that time.", "This is a deadline, not necessarily an action continuing the whole time."],
      ["near", "Our classroom is ___ the main office.", "‘Near’ means close to something, but not necessarily beside it.", "The classroom is close, but its exact position is not given."]
    ]
  },
  {
    title: "Moving Around", level: "Intermediate",
    entries: [
      ["into", "The cat jumped ___ the empty box.", "‘Into’ expresses movement from outside to the inside of a place or container.", "Focus on movement that ends inside something."],
      ["onto", "She stepped ___ the platform.", "‘Onto’ expresses movement to a position on a surface.", "The movement ends on top of a surface."],
      ["through", "We walked ___ the dark tunnel.", "‘Through’ describes movement in one side or end and out of the other.", "The route is inside an enclosed space for part of the journey."],
      ["across", "They swam ___ the river.", "‘Across’ describes movement from one side of an area to the other.", "The destination is the opposite side."],
      ["along", "We cycled ___ the coast for hours.", "‘Along’ means following the length or direction of a line, road, river, or edge.", "The route follows the same line as the coast."],
      ["around", "The Earth moves ___ the Sun.", "‘Around’ describes movement in a circle or on all sides of something.", "Think of an orbit rather than a straight path."],
      ["toward", "The dog ran ___ its owner.", "‘Toward’ shows movement in the direction of someone or something.", "The word gives a direction, but does not promise arrival."],
      ["past", "Walk ___ the bank and turn right.", "‘Past’ means moving beyond a particular person, place, or point.", "You continue beyond the landmark."],
      ["above", "A small lamp hangs ___ the table.", "‘Above’ means at a higher level than something, without necessarily touching it.", "The lamp is higher and not touching the table."],
      ["below", "The temperature fell ___ zero.", "‘Below’ means at a lower level, position, or amount than something.", "The temperature is lower than the reference point."],
      ["between", "The pharmacy is ___ the bank and the bakery.", "‘Between’ is normally used when something is in the middle of two distinct people, places, or things.", "Two places are named, with the pharmacy in the middle."],
      ["behind", "Your backpack is ___ the door.", "‘Behind’ means at or toward the back of something.", "The object is hidden at the back of another object."]
    ]
  },
  {
    title: "Connections", level: "Advanced",
    entries: [
      ["about", "We talked ___ the school trip.", "‘About’ introduces the subject or topic of speaking, thinking, or writing.", "The missing word introduces a topic."],
      ["with", "I agree ___ your main point.", "‘Agree with’ is used when we share the same opinion as a person or accept an idea.", "This adjective-verb pattern shows shared opinion."],
      ["without", "He left ___ saying goodbye.", "‘Without’ means not having or not doing something; it is followed here by an -ing form.", "The action did not happen before he left."],
      ["for", "This present is ___ my best friend.", "‘For’ can identify the intended receiver, purpose, or benefit of something.", "The person is the intended receiver."],
      ["of", "She's very proud ___ her progress.", "‘Proud of’ is a fixed adjective-preposition combination.", "This is a common fixed phrase after ‘proud’."],
      ["despite", "We went out ___ the heavy rain.", "‘Despite’ introduces a noun phrase that contrasts with the surprising result. It is not followed by ‘of’.", "The rain should have stopped the action, but it did not."],
      ["except", "Everyone came ___ Liam.", "‘Except’ excludes one person or thing from a group.", "One person is excluded from ‘everyone’."],
      ["among", "She felt relaxed ___ her close friends.", "‘Among’ describes being surrounded by or included in a group of three or more.", "The reference is a group, not two separate people."],
      ["against", "The bicycle was leaning ___ the wall.", "‘Against’ can mean touching and supported by a surface.", "The wall is supporting the bicycle through contact."],
      ["within", "Please reply ___ three working days.", "‘Within’ means before the end of a stated period of time.", "The reply can come any time before the period ends."],
      ["beyond", "The village lies ___ the mountains.", "‘Beyond’ means farther away than a particular point or on the other side of it.", "The place is farther than the named landmark."],
      ["beside", "Come and sit ___ me.", "‘Beside’ means directly next to or at the side of someone or something.", "The position is immediately at someone's side."]
    ]
  }
];

const state = { puzzle: 0, selected: null, activeIndex: 0, solved: new Set(), letters: {}, attempts: {}, layout: null };
const savedSolved = JSON.parse(localStorage.getItem("prepquest-solved") || "{}");

function makeLayout(entries) {
  const words = entries.map((e, i) => ({ answer: e[0].toUpperCase(), dataIndex: i }));
  const remaining = [...words].sort((a,b) => b.answer.length - a.answer.length);
  const clusters = [];

  // Build small, well-spaced crossword islands. This keeps unrelated words from
  // touching and creating the dense blocks that are hard to read on a phone.
  while (remaining.length) {
    const size = 25;
    const clusterGrid = Array.from({ length: size }, () => Array(size).fill(null));
    const clusterPlaced = [];

    function canPlace(word, row, col, dir) {
      const dr = dir === "down" ? 1 : 0, dc = dir === "across" ? 1 : 0;
      const endR = row + dr * (word.length - 1), endC = col + dc * (word.length - 1);
      if (row < 1 || col < 1 || endR >= size - 1 || endC >= size - 1) return -1;
      let crosses = 0;
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i, c = col + dc * i, existing = clusterGrid[r][c];
        if (existing) {
          if (existing.letter !== word[i] || existing.dirs.has(dir)) return -1;
          crosses++;
        } else {
          // A new horizontal letter needs empty space above and below; a new
          // vertical letter needs empty space on both sides.
          if (dir === "across" && (clusterGrid[r-1][c] || clusterGrid[r+1][c])) return -1;
          if (dir === "down" && (clusterGrid[r][c-1] || clusterGrid[r][c+1])) return -1;
        }
      }
      if (clusterGrid[row-dr]?.[col-dc] || clusterGrid[endR+dr]?.[endC+dc]) return -1;
      return crosses;
    }

    function put(item, row, col, dir) {
      const dr = dir === "down" ? 1 : 0, dc = dir === "across" ? 1 : 0, cells = [];
      for (let i = 0; i < item.answer.length; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (!clusterGrid[r][c]) clusterGrid[r][c] = { letter: item.answer[i], dirs: new Set(), entries: [] };
        clusterGrid[r][c].dirs.add(dir); clusterGrid[r][c].entries.push(item.dataIndex); cells.push([r,c]);
      }
      clusterPlaced.push({ ...item, row, col, dir, cells });
    }

    const seed = remaining.shift();
    put(seed, 12, 12 - Math.floor(seed.answer.length / 2), "across");

    while (true) {
      const candidates = remaining.map(item => {
        const options = [], seen = new Set();
        for (let r=1; r<size-1; r++) for (let c=1; c<size-1; c++) {
          if (!clusterGrid[r][c]) continue;
          for (let i=0; i<item.answer.length; i++) {
            if (item.answer[i] !== clusterGrid[r][c].letter) continue;
            for (const dir of ["across","down"]) {
              const sr=r-(dir==="down"?i:0), sc=c-(dir==="across"?i:0), key=`${sr},${sc},${dir}`;
              if (seen.has(key)) continue; seen.add(key);
              const score=canPlace(item.answer,sr,sc,dir);
              if (score>0) options.push({r:sr,c:sc,dir,score});
            }
          }
        }
        options.sort((a,b)=>a.score-b.score || (Math.abs(a.r-12)+Math.abs(a.c-12))-(Math.abs(b.r-12)+Math.abs(b.c-12)));
        return { item, options };
      }).filter(candidate => candidate.options.length)
        .sort((a,b)=>a.options.length-b.options.length || b.item.answer.length-a.item.answer.length);

      if (!candidates.length) break;
      const chosen=candidates[0], option=chosen.options[0];
      put(chosen.item,option.r,option.c,option.dir);
      remaining.splice(remaining.indexOf(chosen.item),1);
    }

    const minR=Math.min(...clusterPlaced.flatMap(p=>p.cells.map(cell=>cell[0])));
    const maxR=Math.max(...clusterPlaced.flatMap(p=>p.cells.map(cell=>cell[0])));
    const minC=Math.min(...clusterPlaced.flatMap(p=>p.cells.map(cell=>cell[1])));
    const maxC=Math.max(...clusterPlaced.flatMap(p=>p.cells.map(cell=>cell[1])));
    clusters.push({placed:clusterPlaced,minR,maxR,minC,maxC,width:maxC-minC+1,height:maxR-minR+1});
  }

  // Pack the islands with two empty rows/columns between them.
  clusters.sort((a,b)=>b.width-a.width);
  const placed=[]; let cursorR=0,cursorC=0,rowHeight=0,maxC=0;
  for (const cluster of clusters) {
    if (cursorC && cursorC+cluster.width>16) { cursorR+=rowHeight+3; cursorC=0; rowHeight=0; }
    const dr=cursorR-cluster.minR, dc=cursorC-cluster.minC;
    for (const item of cluster.placed) placed.push({...item,row:item.row+dr,col:item.col+dc,cells:item.cells.map(([r,c])=>[r+dr,c+dc])});
    cursorC+=cluster.width+3; rowHeight=Math.max(rowHeight,cluster.height); maxC=Math.max(maxC,cursorC-3);
  }

  const maxR=Math.max(...placed.flatMap(p=>p.cells.map(cell=>cell[0]))), finalMaxC=Math.max(...placed.flatMap(p=>p.cells.map(cell=>cell[1])));
  const grid=Array.from({length:maxR+1},()=>Array(finalMaxC+1).fill(null));
  for (const item of placed) item.cells.forEach(([r,c],i)=>{
    if (!grid[r][c]) grid[r][c]={letter:item.answer[i],entries:[]};
    grid[r][c].entries.push(item.dataIndex);
  });
  const minR=0, minC=0;
  const starts = new Map();
  placed.sort((a,b) => a.row-b.row || a.col-b.col || (a.dir === "across" ? -1 : 1));
  let number = 0;
  for (const p of placed) {
    const key = `${p.row},${p.col}`;
    if (!starts.has(key)) starts.set(key, ++number);
    p.number = starts.get(key);
  }
  return { grid, placed, minR, maxR, minC, maxC:finalMaxC };
}

function renderPuzzle(index) {
  state.puzzle = index; state.selected = null; state.activeIndex = 0; state.letters = {}; state.attempts = {};
  state.solved = new Set(savedSolved[index] || []);
  state.layout = makeLayout(PUZZLES[index].entries);
  if (state.layout.placed.length !== PUZZLES[index].entries.length) console.warn("Not all entries could be placed");
  document.querySelectorAll(".puzzle-tab").forEach((b,i) => b.classList.toggle("active", i === index));
  document.getElementById("puzzle-kicker").textContent = `Crossword 0${index+1} · ${PUZZLES[index].level}`;
  document.getElementById("puzzle-title").textContent = PUZZLES[index].title;
  renderGrid(); renderClues(); updateProgress(); showPlaceholder();
}

function renderGrid() {
  const { grid, placed, minR, maxR, minC, maxC } = state.layout;
  const el = document.getElementById("crossword"); el.innerHTML = "";
  const rows = maxR-minR+1, cols = maxC-minC+1;
  const availableWidth = window.innerWidth < 560 ? window.innerWidth - 76 : 510;
  const cellSize = Math.max(19, Math.min(42, Math.floor(availableWidth / Math.max(rows, cols))));
  el.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`; el.style.setProperty("--cell-size", `${cellSize}px`);
  const numberAt = new Map(placed.map(p => [`${p.row},${p.col}`, p.number]));
  for (let r=minR; r<=maxR; r++) for (let c=minC; c<=maxC; c++) {
    const cell = document.createElement(grid[r][c] ? "button" : "span"); cell.className = "cell";
    if (!grid[r][c]) { cell.classList.add("block"); cell.setAttribute("aria-hidden", "true"); }
    else {
      cell.type = "button";
      cell.classList.add("playable"); cell.dataset.row = r; cell.dataset.col = c;
      cell.setAttribute("aria-label", `Crossword square ${r-minR+1}, ${c-minC+1}`);
      const partOfSolvedWord = grid[r][c].entries.some(i => state.solved.has(i));
      if (partOfSolvedWord) { cell.textContent = grid[r][c].letter; cell.classList.add("solved"); }
      else cell.textContent = state.letters[`${r},${c}`] || "";
      if (numberAt.has(`${r},${c}`)) { const n = document.createElement("span"); n.className="cell-number"; n.textContent=numberAt.get(`${r},${c}`); cell.prepend(n); }
      cell.addEventListener("click", () => selectCell(r,c));
    }
    el.appendChild(cell);
  }
}

function renderClues() {
  for (const dir of ["across", "down"]) {
    const list = document.getElementById(`${dir}-clues`); list.innerHTML = "";
    state.layout.placed.filter(p => p.dir === dir).sort((a,b)=>a.number-b.number).forEach(p => {
      const li=document.createElement("li"), btn=document.createElement("button");
      btn.dataset.entry=p.dataIndex; btn.innerHTML=`<span class="list-number">${p.number}</span><span>${PUZZLES[state.puzzle].entries[p.dataIndex][1]}</span>`;
      if(state.solved.has(p.dataIndex)) btn.classList.add("solved");
      btn.addEventListener("click",()=>selectEntry(p.dataIndex)); li.appendChild(btn); list.appendChild(li);
    });
  }
}

function selectCell(r,c) {
  const choices=state.layout.grid[r][c].entries;
  const next = choices.length>1 && choices.includes(state.selected) ? choices[(choices.indexOf(state.selected)+1)%choices.length] : (choices.find(i=>!state.solved.has(i)) ?? choices[0]);
  selectEntry(next, [r,c]);
}

function selectEntry(index, focusCell) {
  state.selected=index; const p=state.layout.placed.find(x=>x.dataIndex===index);
  state.activeIndex = focusCell ? p.cells.findIndex(c=>c[0]===focusCell[0]&&c[1]===focusCell[1]) : Math.max(0,p.cells.findIndex(c=>!state.letters[`${c[0]},${c[1]}`]));
  document.getElementById("clue-placeholder").hidden=true; document.getElementById("rule-card").hidden=true;
  const active=document.getElementById("clue-active"); active.hidden=false;
  document.getElementById("clue-number").textContent=`${p.number} ${p.dir}`;
  document.getElementById("clue-length").textContent=`${p.answer.length} letters`;
  const answerBlank="_".repeat(p.answer.length);
  document.getElementById("clue-sentence").innerHTML=PUZZLES[state.puzzle].entries[index][1].replace("___",`<span class="blank" aria-label="${p.answer.length} letter blank">${answerBlank}</span>`);
  document.getElementById("feedback").hidden=true;
  document.querySelectorAll(".clue-list button").forEach(b=>b.classList.toggle("selected",Number(b.dataset.entry)===index));
  updateHighlights();
  document.getElementById("mobile-keyboard").focus({preventScroll:true});
}

function updateHighlights() {
  document.querySelectorAll(".cell").forEach(c=>c.classList.remove("active","related"));
  if(state.selected===null)return;
  const p=state.layout.placed.find(x=>x.dataIndex===state.selected);
  p.cells.forEach(([r,c],i)=>{ const el=document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`); el?.classList.add(i===state.activeIndex?"active":"related"); });
}

function typeLetter(letter) {
  if(state.selected===null || state.solved.has(state.selected))return;
  const p=state.layout.placed.find(x=>x.dataIndex===state.selected), [r,c]=p.cells[state.activeIndex];
  state.letters[`${r},${c}`]=letter.toUpperCase();
  if(state.activeIndex<p.cells.length-1)state.activeIndex++;
  renderGrid(); updateHighlights();
}

function eraseLetter() {
  if(state.selected===null || state.solved.has(state.selected))return;
  const p=state.layout.placed.find(x=>x.dataIndex===state.selected); let [r,c]=p.cells[state.activeIndex];
  if(!state.letters[`${r},${c}`]&&state.activeIndex>0){state.activeIndex--;[r,c]=p.cells[state.activeIndex];}
  delete state.letters[`${r},${c}`]; renderGrid();updateHighlights();
}

function checkAnswer() {
  if(state.selected===null)return;
  const p=state.layout.placed.find(x=>x.dataIndex===state.selected);
  const guess=p.cells.map(([r,c])=>state.letters[`${r},${c}`]||"").join("");
  if(guess===p.answer){
    state.solved.add(state.selected); p.cells.forEach(([r,c],i)=>state.letters[`${r},${c}`]=p.answer[i]);
    savedSolved[state.puzzle]=[...state.solved]; localStorage.setItem("prepquest-solved",JSON.stringify(savedSolved));
    showRule(state.selected); renderGrid();renderClues();updateProgress();
    if(state.solved.size===PUZZLES[state.puzzle].entries.length)setTimeout(()=>document.getElementById("celebration").hidden=false,450);
  } else {
    state.attempts[state.selected]=(state.attempts[state.selected]||0)+1;
    const feedback=document.getElementById("feedback"), empty=guess.length<p.answer.length;
    let hint=PUZZLES[state.puzzle].entries[state.selected][3];
    if(state.attempts[state.selected]>=2){ const pos=Math.floor(p.answer.length/2); hint+=` The letter in position ${pos+1} is “${p.answer[pos]}”.`; }
    feedback.innerHTML=`<strong>${empty?"Not finished yet":"Almost — try again"}</strong>${hint}`; feedback.hidden=false;
    feedback.animate([{transform:"translateX(-4px)"},{transform:"translateX(4px)"},{transform:"translateX(0)"}],{duration:220});
  }
}

function showRule(index){
  document.getElementById("clue-active").hidden=true; const card=document.getElementById("rule-card"); card.hidden=false;
  const entry=PUZZLES[state.puzzle].entries[index]; document.getElementById("rule-answer").textContent=entry[0]; document.getElementById("rule-text").textContent=entry[2];
}
function showPlaceholder(){ document.getElementById("clue-placeholder").hidden=false;document.getElementById("clue-active").hidden=true;document.getElementById("rule-card").hidden=true; }
function nextUnsolved(){ const next=state.layout.placed.map(p=>p.dataIndex).find(i=>!state.solved.has(i)); if(next!==undefined)selectEntry(next); }
function updateProgress(){
  const count=state.solved.size,total=PUZZLES[state.puzzle].entries.length;
  document.getElementById("progress-text").textContent=`${count} / ${total}`;document.getElementById("progress-fill").style.width=`${count/total*100}%`;
  const all=Object.values(savedSolved).reduce((n,a)=>n+a.length,0);document.getElementById("total-stars").textContent=all;
}
function resetPuzzle(){
  if(!confirm("Reset every answer in this crossword?"))return;
  savedSolved[state.puzzle]=[];localStorage.setItem("prepquest-solved",JSON.stringify(savedSolved));renderPuzzle(state.puzzle);
}

document.addEventListener("keydown",e=>{
  if(/^[a-zA-Z]$/.test(e.key)){e.preventDefault();typeLetter(e.key);}
  else if(e.key==="Backspace"||e.key==="Delete"){e.preventDefault();eraseLetter();}
  else if(e.key==="Enter"){e.preventDefault();checkAnswer();}
  else if(["ArrowLeft","ArrowUp"].includes(e.key)&&state.selected!==null){e.preventDefault();state.activeIndex=Math.max(0,state.activeIndex-1);updateHighlights();}
  else if(["ArrowRight","ArrowDown"].includes(e.key)&&state.selected!==null){const p=state.layout.placed.find(x=>x.dataIndex===state.selected);e.preventDefault();state.activeIndex=Math.min(p.cells.length-1,state.activeIndex+1);updateHighlights();}
});
document.querySelectorAll(".puzzle-tab").forEach((b,i)=>b.addEventListener("click",()=>renderPuzzle(i)));
document.getElementById("check-answer").addEventListener("click",checkAnswer);
document.getElementById("next-clue").addEventListener("click",nextUnsolved);
document.getElementById("reset-puzzle").addEventListener("click",resetPuzzle);
document.getElementById("continue-button").addEventListener("click",()=>{document.getElementById("celebration").hidden=true;renderPuzzle((state.puzzle+1)%PUZZLES.length);document.querySelector(".game-shell").scrollIntoView();});
document.getElementById("mobile-keyboard").addEventListener("input",e=>{ const chars=e.target.value.match(/[a-z]/gi)||[]; chars.forEach(typeLetter); e.target.value=""; });

renderPuzzle(0);
