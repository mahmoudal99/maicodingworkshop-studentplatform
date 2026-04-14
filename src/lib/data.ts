// ===============================================================
// DATA — extracted from workshop-site.html
// ===============================================================

export interface GlossaryEntry {
  term: string;
  week: string;
  def: string;
  example: string;
}

export interface WeekLink {
  label: string;
  url: string;
  icon: string;
}

export interface WeekSection {
  icon: string;
  title: string;
  items: string[];
}

export interface WeekDiff {
  ahead: string[];
  behind: string[];
}

export interface WeekData {
  num: string;
  label: string;
  title: string;
  sub: string;
  accent: string;
  tags: string[];
  milestone: string;
  overview: string;
  sections: WeekSection[];
  keywords: string[];
  outcomes: string[];
  links: WeekLink[];
  note: string;
  diff: WeekDiff;
}

export interface ResourceData {
  icon: string;
  title: string;
  desc: string;
  tag: string;
  url: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: "Algorithm", week: "W1/W2", def: "A set of steps for solving a problem. Think of it like a recipe: if the steps are clear, someone else can follow them too.", example: "Making tea is an algorithm: boil water, add teabag, pour water, wait, then drink." },
  { term: "Binary", week: "W1", def: "The number system computers use. Instead of lots of symbols, it only uses 0 and 1, like a switch that can be off or on.", example: "The number 5 in binary is 101, which means 4 + 1." },
  { term: "Bit", week: "W1", def: "The smallest piece of computer data. A bit can only be 0 or 1, like a tiny light switch.", example: "If a bit is 0, think 'off'. If it is 1, think 'on'." },
  { term: "Byte", week: "W1", def: "A group of 8 bits. Bytes are the standard unit for measuring data. One byte can represent a number from 0 to 255, or a single character.", example: "The letter 'A' is stored as one byte: 01000001 in binary." },
  { term: "Coding", week: "W1", def: "Writing a set of instructions in a language a computer can understand. You write the steps; the computer follows them exactly — including your mistakes.", example: "When you type code like `alert('Hello')` and the browser shows a popup, that's coding in action." },
  { term: "Programming Language", week: "W1", def: "A special language designed for giving instructions to computers. Examples include JavaScript, Python, and Scratch. Each has its own rules (syntax) but they all do the same job: tell the computer what to do.", example: "JavaScript is the programming language of the web — every browser can run it." },
  { term: "CPU", week: "W1", def: "The part of the computer that follows instructions and does the work. You can think of it as the computer's brain.", example: "When you click a button, the CPU helps process that click and decide what happens next." },
  { term: "RAM", week: "W1", def: "The computer's short-term memory. It keeps track of what you are using right now, like a desk where you spread out the work you're doing.", example: "If you open lots of tabs and apps, they all use RAM while they are open." },
  { term: "Input \u2192 Process \u2192 Output", week: "W1", def: "A simple way to describe what computers do: you give something in, the computer works on it, and then you get a result back.", example: "You type a password (input), the computer checks it (process), and tells you if you can log in (output)." },
  { term: "Pseudocode", week: "W2", def: "Writing your program idea in plain English before writing real code. It is like planning your route before you start driving.", example: "IF it is raining\n  take an umbrella\nELSE\n  wear sunglasses" },
  { term: "Scratch", week: "W2", def: "A coding tool where you build programs by snapping blocks together instead of typing lots of symbols.", example: "In Scratch, you can make a character move or talk by dragging blocks into place." },
  { term: "Variable", week: "W3", def: "A named box that stores information. You can put a value in it, read it later, and sometimes change it.", example: "A variable called `score` might start at 0 and go up every time you answer correctly." },
  { term: "let / const", week: "W3", def: "`let` is for a value that can change. `const` is for a value that should stay the same after you set it.", example: "`let score = 0` can change later, but `const name = 'Aisha'` is meant to stay the same." },
  { term: "console.log()", week: "W3", def: "A way to print a message into the browser console so you can see what your code is doing. It is like asking your code to talk back to you.", example: "If you write `console.log(score)`, you can check what `score` is right now." },
  { term: "Conditional (if/else)", week: "W3", def: "Code that makes a decision. It is like saying, 'if this is true, do this, otherwise do that.'", example: "If your age is 18 or more, show 'adult'; otherwise show 'under 18'." },
  { term: "String", week: "W3", def: "A string is text in code. If it is words, letters, or symbols in quotes, it is usually a string.", example: "`'Hello'` and `'Yusuf'` are both strings." },
  { term: "Function", week: "W4", def: "A reusable block of code that does one job. Think of it like a button you can press whenever you want the same action to happen again.", example: "A `greet()` function can show a welcome message every time a new player joins." },
  { term: "Loop", week: "W4", def: "Code that repeats something. It is like telling the computer, 'keep doing this until I say stop.'", example: "A loop can count from 1 to 10 without you writing 10 separate lines." },
  { term: "Array", week: "W4", def: "A list of values stored together in one place. Think of it like a row of labelled boxes.", example: "An array could store `['red', 'green', 'blue']` so your code can use a list of colours." },
  { term: "DOM", week: "W4", def: "The browser's way of representing everything on a webpage so JavaScript can change it. It is like the page's control panel.", example: "If JavaScript changes the text of a heading on the page, it is using the DOM." },
  { term: "DRY", week: "W4", def: "Short for 'Don't Repeat Yourself'. It means if you are writing the same code again and again, there is probably a cleaner way.", example: "If the same greeting appears in three places, you might put it in one function instead of copying it three times." },
  { term: "Syntax Error", week: "W4", def: "A mistake in how the code is written, like a missing bracket or quote. It is like a spelling mistake that stops the computer from understanding you.", example: "If you forget the closing `)` in `console.log('Hi'`, JavaScript will show a syntax error." },
  { term: "Logic Error", week: "W4", def: "A mistake in the idea behind the code. The code runs, but it gives the wrong result.", example: "If a quiz says you lose when your score is 10 even though 10 should win, that is a logic error." },
  { term: "HTML", week: "W5", def: "The structure of a webpage. It decides what is on the page, like headings, paragraphs, images, and links.", example: "HTML is like the skeleton of a page: it gives everything its basic shape." },
  { term: "CSS", week: "W5", def: "The part that controls how a webpage looks, like colours, fonts, spacing, and layout.", example: "If HTML is the skeleton, CSS is the clothes and style." },
  { term: "JavaScript (JS)", week: "W3", def: "The language that makes websites interactive. It lets pages respond to clicks, typing, timers, and more.", example: "If a button opens a menu or updates a score, JavaScript is usually involved." },
  { term: "Event Listener", week: "W4/W5", def: "Code that waits for something to happen, like a click or key press, and then reacts to it.", example: "A button can 'listen' for a click and then show a hidden message." },
  { term: "Deployment", week: "W5", def: "Putting your project online so other people can visit it with a link.", example: "A project on your laptop is private; a deployed project has a live URL you can share." },
  { term: "Netlify", week: "W5", def: "A tool that helps you put websites online easily. You can often publish by dragging in your project folder.", example: "Netlify Drop lets you drag your site in and get a live link back." },
  { term: "LLM", week: "W5", def: "Short for Large Language Model. It is an AI system trained on lots of text so it can generate writing, answer questions, and even suggest code.", example: "When you ask an AI chatbot for code and it writes some for you, it is using an LLM." },
  { term: "Prompt Engineering", week: "W5", def: "Writing clear instructions for an AI so it gives you more useful results. Better questions usually lead to better answers.", example: "Instead of saying 'make a page', you might say 'make a blue webpage with a heading, a button, and a score counter'." },
  { term: "Debugging", week: "W2\u2013W5", def: "Finding out why your code is not working and fixing it. It is basically detective work for programmers.", example: "You read the error, test one idea, change the code, and see if the problem is gone." },
  { term: "CodePen", week: "W3\u2013W5", def: "A website where you can write HTML, CSS, and JavaScript in the browser and see the result straight away.", example: "CodePen is useful when you want to try a quick idea without installing anything." },
];

export const WEEKS_A: WeekData[] = [
  {
    num: "W1", label: "Week 1",
    title: "Inside the Machine",
    sub: "Bits, memory, and code inside a futuristic lab",
    accent: "#46d9ff",
    tags: ["Machine Lab", "Binary", "Memory Systems", "Code Flow"],
    milestone: "Power up the lab by tracing how instructions become real results.",
    overview: "This week you step inside a futuristic machine lab. Each node is a short mission where you power systems, route signals, wake up memory rooms, and discover how code becomes something you can actually see on screen.",
    sections: [
      {
        icon: "\u26a1", title: "Machine Missions",
        items: [
          "Bit Reactor",
          "Parts Bay Repair",
          "Command Builder",
          "Code Conveyor",
          "Command Relay"
        ]
      },
      {
        icon: "\ud83d\udca1", title: "System Rooms",
        items: [
          "Byte Forge",
          "Signal Tunnel",
          "Memory Vault",
          "Literal Bot Test",
          "Launch the Lab"
        ]
      }
    ],
    keywords: ["Binary", "Bit", "Byte", "CPU", "RAM", "Input \u2192 Process \u2192 Output", "Coding", "Programming Language"],
    outcomes: [
      "Can explain what a bit and a byte are in their own words",
      "Can name the main parts of a computer and what each one does",
      "Understands Input \u2192 Process \u2192 Output",
      "Can explain what coding is and how it connects to the hardware they just explored"
    ],
    links: [],
    note: "You do not need to memorise the whole machine at once. Power one room, solve one mission, and the system starts making sense piece by piece.",
    diff: {
      ahead: ["Build bigger numbers in the reactor without help", "Spot which parts of your own device are RAM, storage, and output", "Trace what happens after you click a button on a web page"],
      behind: ["Replay the lab missions you enjoyed most \u2014 repetition is part of how this clicks", "Focus on the big idea that computers follow simple instructions one step at a time"]
    }
  },
  {
    num: "W2", label: "Week 2",
    title: "Problem Solving \u2014 Think Like a Programmer",
    sub: "Pseudocode, Scratch, and your first algorithm",
    accent: "#34d399",
    tags: ["Pseudocode", "Scratch", "Conditionals", "Loops"],
    milestone: "Finish and share your first Scratch project.",
    overview: "This week is about learning how programmers think. Before syntax, you practise breaking problems into clear, simple steps that a computer could follow.",
    sections: [
      {
        icon: "\u26a1", title: "Activities",
        items: [
          "Toast challenge: write instructions for making toast precise enough a computer could follow them. Read them aloud. Watch them fail. Why do machines need precision?",
          "Sort yourselves: the group sorts by birthday using only a fixed number of comparisons \u2014 one pair at a time. Introduces algorithmic thinking.",
          "Pseudocode practice: write step-by-step logic for a simple task \u2014 is a number even? What should I wear today?",
          "Build in Scratch at scratch.mit.edu \u2014 make a simple animation or interactive story and share it."
        ]
      },
      {
        icon: "\ud83d\udca1", title: "Key Concepts",
        items: [
          "Pseudocode: writing logic in plain English before translating to code",
          "Conditionals: if this, do that \u2014 else, do something else",
          "Loops: repeating an action until a condition is met",
          "Algorithms: many ways to solve a problem; some are more efficient"
        ]
      }
    ],
    keywords: ["Pseudocode", "Algorithm", "Scratch"],
    outcomes: [
      "Can write pseudocode for a simple everyday task",
      "Understands if/else and loops as concepts",
      "Has built and shared a first Scratch project"
    ],
    links: [
      { label: "Scratch \u2014 build for free", url: "https://scratch.mit.edu", icon: "\ud83d\udc31" },
    ],
    note: "Scratch is here to make coding feel approachable. You can focus on the logic without worrying about spelling every line perfectly.",
    diff: {
      ahead: ["Try to recreate a simple game in Scratch", "Write pseudocode for the guessing game you'll build in Week 4"],
      behind: ["Focus on the toast challenge and pseudocode first \u2014 Scratch can come after"]
    }
  },
  {
    num: "W3", label: "Week 3",
    title: "First Code \u2014 JavaScript Basics",
    sub: "Variables, logic, and debugging from day one",
    accent: "#fbbf24",
    tags: ["Variables", "if/else", "console.log()", "Bug hunt"],
    milestone: "Write a JavaScript program that runs in the browser.",
    overview: "This is your first real coding week. JavaScript runs right in the browser, so you can type something small, test it, change it, and see what happens immediately.",
    sections: [
      {
        icon: "\u26a1", title: "Activities",
        items: [
          "console.log('Hello World'): open the browser console, type one line, see it respond. Then output text onto the page using innerHTML.",
          "Variables as labelled boxes: change the value, print it again, watch it update. Use let and const \u2014 explain the difference simply.",
          "Build a quiz: 3\u20135 questions using prompt() and if/else for scoring, display the result on the page.",
          "Bug hunt round 1: six broken JS snippets on screen. Find and fix. Missing semicolons, wrong quotes, undefined variables, case sensitivity, unclosed brackets. Competitive format \u2014 fastest wins."
        ]
      },
      {
        icon: "\ud83d\udca1", title: "Key Concepts",
        items: [
          "Variables: let and const \u2014 naming and storing data",
          "console.log() \u2014 your first debugging tool",
          "if / else if / else \u2014 making decisions in code",
          "Strings: text in code, wrapped in quotes",
          "Reading error messages: the red text almost always tells you the line and the problem"
        ]
      }
    ],
    keywords: ["Variable", "let / const", "console.log()", "Conditional (if/else)", "String", "Syntax Error", "Debugging", "JavaScript (JS)", "CodePen"],
    outcomes: [
      "Has written and run a first JavaScript program",
      "Can use variables, conditionals, and output text to the page",
      "Has practised reading a console error to find a bug"
    ],
    links: [
      { label: "CodePen \u2014 code in your browser", url: "https://codepen.io", icon: "\u270f\ufe0f" },
      { label: "MDN \u2014 JavaScript basics", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics", icon: "\ud83d\udcda" },
    ],
    note: "When something breaks, open the console first. The error message is there to help you, not judge you.",
    diff: {
      ahead: ["Add a timer to the quiz", "Try to use a loop to repeat questions", "Explore what typeof does"],
      behind: ["Focus on variables and console.log only \u2014 the quiz can wait", "Work through the bug hunt with a partner"]
    }
  },
  {
    num: "W4", label: "Week 4",
    title: "Build with Loops and Functions",
    sub: "Reusable code, better debugging, and a real game",
    accent: "#f87171",
    tags: ["Functions", "Loops", "Arrays", "DOM", "Bug hunt 2"],
    milestone: "Build a number guessing game with a replay button.",
    overview: "This is where your code starts feeling more powerful. Loops and functions help you write less, reuse more, and build something that feels like a real game.",
    sections: [
      {
        icon: "\u26a1", title: "Activities",
        items: [
          "Fix the code: work through intentionally broken JS programs \u2014 syntax errors, logic errors, and messy structure. Find the problem and explain the fix.",
          "Number guessing game: Math.random() picks a number, the player types guesses, gets 'too high' / 'too low' feedback, and can reset to play again.",
          "Refactor challenge: rewrite part of last week's quiz using functions. Same result, cleaner code.",
          "Bug hunt round 2: harder JS \u2014 wrong scope, off-by-one loops, missing return statements, functions called before definition."
        ]
      },
      {
        icon: "\ud83d\udca1", title: "Key Concepts",
        items: [
          "Functions: write once, call many times",
          "for and while loops: repeating with control",
          "Arrays: storing multiple values in one variable",
          "DOM: getElementById, addEventListener, innerHTML",
          "Logic errors vs syntax errors \u2014 two very different problems",
          "DRY \u2014 Don't Repeat Yourself"
        ]
      }
    ],
    keywords: ["Function", "Loop", "Array", "DOM", "DRY", "Syntax Error", "Logic Error", "Event Listener"],
    outcomes: [
      "Can write and call their own functions",
      "Can build a loop that runs until a condition is met",
      "Has built a real interactive browser game",
      "Has practised diagnosing both syntax and logic errors"
    ],
    links: [
      { label: "CodePen \u2014 code in your browser", url: "https://codepen.io", icon: "\u270f\ufe0f" },
      { label: "MDN \u2014 Functions guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions", icon: "\ud83d\udcda" },
      { label: "MDN \u2014 Loops and iteration", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration", icon: "\ud83d\udcda" },
    ],
    note: "Debugging is part of coding, not proof that you're bad at it. Every bug you track down is helping you think more like a developer.",
    diff: {
      ahead: ["Add a difficulty selector \u2014 easy/hard changes the number range", "Track a high score using an array", "Rewrite the game so every action has its own function"],
      behind: ["Focus on the guessing game only \u2014 skip refactor", "Use bug hunt time to revisit Week 3 concepts"]
    }
  },
  {
    num: "W5", label: "Week 5",
    title: "Let's Go to the Web \u2014 Then Further with AI",
    sub: "HTML, CSS, JS + AI to help you go further",
    accent: "#4a9eff",
    tags: ["HTML", "CSS", "AI / LLMs", "Netlify", "Prompt engineering"],
    milestone: "Put a styled, interactive website online and add at least one AI-assisted feature.",
    overview: "First you build your site yourself. Then you use AI to help you go further. Because you're learning the basics first, you'll be able to tell whether the AI is helping or just making a mess.",
    sections: [
      {
        icon: "\ud83c\udf10", title: "Part 1 \u2014 Build it yourself",
        items: [
          "Open View Source on a real website. Spot the HTML structure, CSS links, and script tags. Every website is made of text the browser knows how to read.",
          "Build an About Me page in CodePen: heading, bio, photo placeholder, links. No templates.",
          "Styling sprint: colours, fonts, spacing. Make it look deliberate.",
          "Add a JS interaction from Weeks 3\u20134: dark mode toggle, show/hide section, click counter."
        ]
      },
      {
        icon: "\ud83e\udd16", title: "Part 2 \u2014 Extend with AI",
        items: [
          "What is an LLM? A quick explainer on how AI tools generate code, why they can be useful, and why they still make mistakes.",
          "First prompt: ask an AI to add a feature \u2014 animated section, contact form, colour theme switcher.",
          "Read it back: explain every line of AI-generated code before you paste it. If you can't explain it yet, slow down and inspect it.",
          "Break it on purpose. Change a variable name, remove a bracket. Find it. Fix it.",
          "Prompting challenge: who can get a working feature in the fewest messages?",
          "Netlify Drop: drag the folder, get a live URL. Share it."
        ]
      },
      {
        icon: "\ud83d\udca1", title: "Key Concepts",
        items: [
          "HTML: structure \u2014 headings, paragraphs, links, images, divs",
          "CSS: presentation \u2014 colour, font, spacing, layout",
          "JS in the page: linking a script, selecting elements, responding to events",
          "LLMs: large language models \u2014 what they are and how they generate code",
          "Prompt engineering: context + specificity = better output",
          "Deployment: your code running on a server for the world to access"
        ]
      }
    ],
    keywords: ["HTML", "CSS", "JavaScript (JS)", "DOM", "Event Listener", "Deployment", "Netlify", "LLM", "Prompt Engineering", "Debugging"],
    outcomes: [
      "Has a live website with a shareable URL",
      "Has used AI to add a feature and can explain what the code does",
      "Understands AI as an accelerator, not a replacement for understanding",
      "Can write an effective prompt and evaluate the output critically"
    ],
    links: [
      { label: "CodePen \u2014 live editor", url: "https://codepen.io", icon: "\u270f\ufe0f" },
      { label: "Netlify Drop \u2014 deploy instantly", url: "https://app.netlify.com/drop", icon: "\ud83d\ude80" },
      { label: "Claude \u2014 AI coding assistant", url: "https://claude.ai", icon: "\ud83e\udd16" },
      { label: "MDN \u2014 HTML basics", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics", icon: "\ud83d\udcda" },
      { label: "MDN \u2014 CSS basics", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics", icon: "\ud83d\udcda" },
    ],
    note: "The 'read it back' rule matters. If you can explain the AI code, you're learning. If you're only copying it, you're missing the best part.",
    diff: {
      ahead: ["Build a second page and link between them", "Try fetching data from a public API", "Refactor your site's JS into clean, named functions"],
      behind: ["Focus on getting the HTML and CSS right first \u2014 JS can come after", "Use AI to help style, not to build everything"]
    }
  },
  {
    num: "W6", label: "Week 6",
    title: "Final Project & Demo Day",
    sub: "Ship it, present it, celebrate it",
    accent: "#34d399",
    tags: ["Build sprint", "Deploy", "Demo", "What's next"],
    milestone: "Put your website online and show it to the group.",
    overview: "This final week is about finishing, sharing, and being proud of what you've built. Your goal isn't perfection \u2014 it's shipping something real and explaining one thing you made.",
    sections: [
      {
        icon: "\ud83d\udccb", title: "Session Structure",
        items: [
          "Arrival & setup (10 min): open your project, write down your one goal for today.",
          "Build sprint (45 min): focus on your last fixes and features before you deploy.",
          "Polish (10 min): does it load? Is the JS working? Is the text readable on a phone?",
          "Deploy (5 min): Netlify Drop. One folder, one drag, one live URL.",
          "Demos: 2\u20133 minutes each \u2014 show it, explain one thing you built, share one thing you'd add next.",
          "Paths into tech: hear about different ways people get into coding and keep improving.",
          "What next: walk through the resource sheet. Your journey continues."
        ]
      },
      {
        icon: "\ud83c\udf99\ufe0f", title: "Demo Format",
        items: [
          "Show: open your project and demonstrate it working",
          "Explain: one specific thing you built and how it works",
          "Reflect: one thing you would add or improve with more time"
        ]
      }
    ],
    keywords: ["Deployment", "Netlify"],
    outcomes: [
      "Has put a website online with a real, shareable URL",
      "Has presented their work to the group",
      "Knows at least three ways to keep learning after today"
    ],
    links: [
      { label: "Netlify Drop \u2014 deploy instantly", url: "https://app.netlify.com/drop", icon: "\ud83d\ude80" },
    ],
    note: "Your demo does not need to be perfect. If you can show something real and explain one part of it, that's a big win.",
    diff: {
      ahead: ["Restart from scratch \u2014 same idea, cleaner code", "Add a Node.js backend or connect to a public API", "Mentor someone who's still finishing"],
      behind: ["Demo one working feature \u2014 small and works beats large and broken", "Use the sprint to finish and deploy what you have"]
    }
  }
];

export const WEEKS_B: WeekData[] = [
  {
    num: "W1", label: "Week 1",
    title: "Problem Solving \u2014 Think Like a Programmer",
    sub: "Pseudocode, Scratch, and your first algorithm",
    accent: "#34d399",
    tags: ["Pseudocode", "Scratch", "Algorithms", "Project idea"],
    milestone: "Finish and share your first Scratch project.",
    overview: "You jump straight into thinking like a programmer \u2014 writing precise instructions, spotting ambiguity, and building something interactive in Scratch.",
    sections: [
      {
        icon: "\u26a1", title: "Activities",
        items: [
          "Toast challenge: write instructions for making toast precise enough that a computer could follow them. Watch them fail. Why do machines need precision?",
          "Sort yourselves: group sorts by birthday using only a fixed number of comparisons. Introduces efficiency and algorithmic thinking.",
          "Pseudocode practice: write logic for a simple task \u2014 is a number even? What should I wear today?",
          "Build in Scratch: simple animation or interactive story. Publish it.",
          "Sketch your website idea on paper. What pages will it have? Who is it for?"
        ]
      },
      {
        icon: "\ud83d\udca1", title: "Key Concepts",
        items: [
          "Pseudocode: logic in plain English before real code",
          "Conditionals and loops as concepts",
          "Algorithms: precision and efficiency"
        ]
      }
    ],
    keywords: ["Pseudocode", "Algorithm", "Scratch"],
    outcomes: [
      "Can write pseudocode for a simple task",
      "Understands if/else and loops as concepts",
      "Has a shared Scratch project and a project idea"
    ],
    links: [
      { label: "Scratch \u2014 build for free", url: "https://scratch.mit.edu", icon: "\ud83d\udc31" },
    ],
    note: "This path starts fast. If you already feel comfortable using a computer, jumping straight into problem solving can be a fun way to begin.",
    diff: {
      ahead: ["Recreate a simple game in Scratch", "Write pseudocode for the guessing game in Week 3"],
      behind: ["Focus on the toast challenge and pseudocode only"]
    }
  },
  {
    num: "W2", label: "Week 2",
    title: "First Code \u2014 JavaScript Basics",
    sub: "Variables, logic, and debugging from day one",
    accent: "#fbbf24",
    tags: ["Variables", "if/else", "console.log()", "Bug hunt"],
    milestone: "Write a JavaScript program that runs in the browser.",
    overview: "You already started thinking algorithmically. Now you turn that logic into real code you can run and test in the browser.",
    sections: [
      {
        icon: "\u26a1", title: "Activities",
        items: [
          "console.log('Hello World'): first line of JS. Then output text onto the page using innerHTML.",
          "Variables as labelled boxes: change the value, print again, watch it update. let vs const.",
          "Build a quiz: 3\u20135 questions, if/else scoring, display result on page.",
          "Bug hunt round 1: six broken JS snippets. Find and fix. Competitive format."
        ]
      },
      {
        icon: "\ud83d\udca1", title: "Key Concepts",
        items: [
          "Variables: let and const",
          "console.log() \u2014 first debugging tool",
          "if / else if / else",
          "Strings, numbers, reading error messages"
        ]
      }
    ],
    keywords: ["Variable", "let / const", "console.log()", "Conditional (if/else)", "String", "Debugging", "CodePen"],
    outcomes: [
      "Has written and run a first JavaScript program",
      "Can use variables and conditionals",
      "Has practised reading a console error"
    ],
    links: [
      { label: "CodePen \u2014 code in your browser", url: "https://codepen.io", icon: "\u270f\ufe0f" },
      { label: "MDN \u2014 JavaScript basics", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics", icon: "\ud83d\udcda" },
    ],
    note: "This path moves quickly, but the goal is the same: write small pieces of code, test them, and build confidence one step at a time.",
    diff: {
      ahead: ["Add a timer to the quiz", "Explore typeof"],
      behind: ["Focus on variables and console.log only"]
    }
  },
  {
    num: "W3", label: "Week 3",
    title: "Build with Loops and Functions",
    sub: "Reusable code, better debugging, and a real game",
    accent: "#f87171",
    tags: ["Functions", "Loops", "Arrays", "DOM"],
    milestone: "Build a number guessing game with a replay button.",
    overview: "Loops and functions help your code do more with less repetition. This is where you start building something that feels like a real interactive project.",
    sections: [
      {
        icon: "\u26a1", title: "Activities",
        items: [
          "Fix the code: work through broken JS programs and explain what changed.",
          "Number guessing game: Math.random(), too high/too low hints, attempt counter, reset button.",
          "Refactor challenge: rewrite last week's quiz using functions so the code is cleaner and easier to reuse.",
          "Bug hunt round 2: harder JS \u2014 wrong scope, off-by-one, missing return, functions before definition."
        ]
      },
      {
        icon: "\ud83d\udca1", title: "Key Concepts",
        items: ["Functions", "for and while loops", "Arrays", "DOM interactions", "DRY", "Logic vs syntax errors"]
      }
    ],
    keywords: ["Function", "Loop", "Array", "DOM", "DRY", "Logic Error", "Event Listener"],
    outcomes: [
      "Can write and call functions",
      "Can build a loop that runs until a condition is met",
      "Has built a real interactive browser game"
    ],
    links: [
      { label: "CodePen \u2014 code in your browser", url: "https://codepen.io", icon: "\u270f\ufe0f" },
      { label: "MDN \u2014 Functions guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions", icon: "\ud83d\udcda" },
    ],
    note: "If this week feels harder, that's normal. You're learning tools that make bigger projects possible.",
    diff: {
      ahead: ["Add difficulty selector to guessing game", "Track high score with an array"],
      behind: ["Focus on guessing game only \u2014 skip refactor"]
    }
  },
  {
    num: "W4", label: "Week 4",
    title: "Let's Go to the Web \u2014 Then Further with AI",
    sub: "HTML, CSS, JS + AI to extend your site",
    accent: "#4a9eff",
    tags: ["HTML", "CSS", "AI / LLMs", "Netlify"],
    milestone: "Put a styled, interactive website online with an AI-assisted feature.",
    overview: "You already have enough JavaScript to build something real. This week you turn that into a website, then use AI carefully to help you go further.",
    sections: [
      {
        icon: "\ud83c\udf10", title: "Part 1 \u2014 Build it yourself",
        items: [
          "View Source on a real website and spot the HTML, CSS, and JavaScript.",
          "Build an About Me page in CodePen: heading, bio, photo, links. No templates.",
          "Styling sprint: colours, fonts, spacing.",
          "Add a JS interaction from Weeks 2\u20133."
        ]
      },
      {
        icon: "\ud83e\udd16", title: "Part 2 \u2014 Extend with AI",
        items: [
          "Quick intro: what is an LLM?",
          "Use AI to add an ambitious feature.",
          "Read it back: explain every line before pasting.",
          "Break it on purpose. Fix it.",
          "Prompting challenge: fewest messages to a working feature.",
          "Netlify Drop: deploy and share."
        ]
      }
    ],
    keywords: ["HTML", "CSS", "JavaScript (JS)", "LLM", "Prompt Engineering", "Deployment", "Netlify"],
    outcomes: [
      "Has a live website with a shareable URL",
      "Has used AI and can explain the generated code",
      "Can write an effective prompt"
    ],
    links: [
      { label: "CodePen \u2014 live editor", url: "https://codepen.io", icon: "\u270f\ufe0f" },
      { label: "Netlify Drop", url: "https://app.netlify.com/drop", icon: "\ud83d\ude80" },
      { label: "Claude \u2014 AI coding assistant", url: "https://claude.ai", icon: "\ud83e\udd16" },
      { label: "MDN \u2014 HTML basics", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics", icon: "\ud83d\udcda" },
    ],
    note: "AI can help you move faster, but your understanding still matters most. Use it to extend your ideas, not replace them.",
    diff: {
      ahead: ["Build a second page", "Fetch data from a public API"],
      behind: ["Get HTML and CSS solid first \u2014 JS can follow"]
    }
  },
  {
    num: "W5", label: "Week 5",
    title: "Project Work Week",
    sub: "Build, get unstuck, review, and polish",
    accent: "#46d9ff",
    tags: ["Build sprint", "Peer review", "Q&A", "Tips"],
    milestone: "Get your project into strong shape and ready to show next week.",
    overview: "This week is for building, asking questions, and making your project stronger. No big new concepts \u2014 just time to make real progress.",
    sections: [
      {
        icon: "\ud83d\udccb", title: "Structure",
        items: [
          "Start by deciding what you want to finish today and what is still blocking you.",
          "Build sprint (60 min): focus on making progress on your project.",
          "Peer review (15 min): swap with the person next to you, try each other's site, and give one helpful piece of feedback.",
          "Tip round (15 min): collect a few practical ideas you can use to improve your project.",
          "Q&A: open floor \u2014 any question goes."
        ]
      }
    ],
    keywords: ["Debugging", "Deployment"],
    outcomes: [
      "Project is in strong shape and close to ready",
      "Has received peer feedback and acted on one piece of it",
      "Knows what they want to show next week"
    ],
    links: [
      { label: "Netlify Drop", url: "https://app.netlify.com/drop", icon: "\ud83d\ude80" },
    ],
    note: "This week is about momentum, not perfection. A smaller finished project is better than a bigger project that still feels unfinished.",
    diff: {
      ahead: ["Restart from scratch \u2014 same idea, cleaner code", "Add a backend or second page", "Become a peer mentor"],
      behind: ["Use the full sprint to finish the core site", "Ask for help early instead of staying stuck", "Scope your demo down to one working feature"]
    }
  },
  {
    num: "W6", label: "Week 6",
    title: "Final Project & Demo Day",
    sub: "Ship it, present it, celebrate it",
    accent: "#34d399",
    tags: ["Build sprint", "Deploy", "Demo", "What's next"],
    milestone: "Put your website online and present it to the group.",
    overview: "This is your finish line. Polish what you have, deploy it, and show what you built. The goal is to share something real, not something perfect.",
    sections: [
      {
        icon: "\ud83d\udccb", title: "Session Structure",
        items: [
          "Polish sprint (30 min): final tidy before deployment.",
          "Deploy with Netlify Drop.",
          "Demos: show it, explain one thing you built, share one thing you'd add next.",
          "Paths into tech: hear about different ways people keep learning after a first project.",
          "What next: walk through the resource sheet."
        ]
      }
    ],
    keywords: ["Deployment", "Netlify"],
    outcomes: [
      "Has a website online with a shareable URL",
      "Has presented their work to the group",
      "Knows how to keep learning"
    ],
    links: [
      { label: "Netlify Drop", url: "https://app.netlify.com/drop", icon: "\ud83d\ude80" },
    ],
    note: "You do not need a perfect project for this to count. If you built something real and can talk about it, you've done something impressive.",
    diff: {
      ahead: ["Restart from scratch with cleaner architecture", "Mentor someone finishing up"],
      behind: ["Demo one feature that works \u2014 that's enough"]
    }
  }
];

export const RESOURCES: ResourceData[] = [
  { icon: "\u2692\ufe0f", title: "The Odin Project", desc: "Full-stack web development curriculum. Self-paced, project-based, completely free.", tag: "Free \u00b7 Web dev path", url: "https://www.theodinproject.com" },
  { icon: "\ud83d\udcbb", title: "freeCodeCamp", desc: "Hundreds of hours of structured JavaScript challenges. Free certificate on completion.", tag: "Free \u00b7 JavaScript & web", url: "https://www.freecodecamp.org" },
  { icon: "\ud83d\udcd6", title: "MDN Web Docs", desc: "Mozilla's reference for HTML, CSS, and JavaScript. The most reliable docs on the web.", tag: "Free \u00b7 Reference", url: "https://developer.mozilla.org" },
  { icon: "\u270f\ufe0f", title: "Codecademy", desc: "Interactive lessons with immediate feedback. Good structured entry point for JS or Python.", tag: "Free tier \u00b7 Structured", url: "https://www.codecademy.com" },
  { icon: "\ud83d\ude80", title: "Build something", desc: "Pick any idea. Try to build it. Break it. Google the error. Fix it. Repeat. This is how it actually works.", tag: "Always \u00b7 Everyone", url: "https://codepen.io" },
];
