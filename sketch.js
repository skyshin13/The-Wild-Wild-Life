let gameState = "start";
let width = 800;
let height = 600;

let welcome;
let pixelfont;
let currentLocation = 0;
let rangers = 0;
let animalSprites = [];
let currentRanger;

let arrowButtons = {
  left: {x: 50, y: height / 2 - 25, w: 50, h: 50},
  right: {x: width - 100, y: height / 2 - 25, w: 50, h: 50}
};

let username = "";
let usernameInputActive = false;

let animals = [];
let rangerMessages = [];

let mailTimer = 0;
let nextSpawnTime = 0;

let mailMessage = null;
let clickedAnimal = null;

let mailArrived = false;
let newMail = false;

function preload() {
  welcome = loadImage('assets/locations/welcome.png');
  pixelfont = loadFont('assets/font/pixelfont.ttf');
  locations = [
    loadImage('assets/locations/beach.png'), loadImage('assets/locations/street.png'), loadImage('assets/locations/trailWater.png'), loadImage('assets/locations/tree.png'), loadImage('assets/locations/water.png')
  ];
  rangers = [
    loadImage('assets/rangers/ranger1.png'), loadImage('assets/rangers/ranger2.png'), loadImage('assets/rangers/ranger3.png'), loadImage('assets/rangers/ranger4.png'), loadImage('assets/rangers/ranger5.png'),
  loadImage('assets/rangers/ranger6.png')];
  animalSprites = [loadImage('assets/animals/cardinal.png'),
      loadImage('assets/animals/cat.png')
  ];
    
}

class Animal {
  constructor(data) {
    this.species = data.species;
    this.animalClass = data.animalClass;
    this.status = data.status;
    this.condition = data.condition;
    this.action = data.action;
    this.imageIndex = data.imageIndex;
    
    let xmargin = 50;
    let ymargin = 150;
    this.x = random(xmargin, width - xmargin);
    this.y = random(height * 0.85, height - ymargin);

    this.size = random(30, 70);
  }

  display(x = null, y = null, size = null) {
    let drawX = x ?? this.x;
    let drawY = y ?? this.y;
    let drawSize = size ?? this.size;
    
    imageMode(CENTER);
    image(animalSprites[this.imageIndex], drawX, drawY, drawSize, drawSize);
    imageMode(CORNER);
    
    textAlign(CENTER);
    textSize(12);
  }
}

let animalData = [
  {
    species: "Common Cardinal",
    animalClass: "Bird",
    status: "Domestic",
    condition: "Healthy",
    count: 15,
    action: "Taken to ACC",
    imageIndex: 0,
  },
  {
    species: "Cat",
    animalClass: "Domestic",
    status: "Domestic",
    condition: "Injured",
    count: 7,
    action: "Relocated",
    imageIndex: 1,
  },
];

let buttonLayouts = {
  start: {x: width / 2 - 80, y: height / 2 + 140, w: 160, h: 60},
  infoCard: {
    exit: {x: width / 2 + 190, y: height / 2 - 135, w: 25, h: 25},
    ranger: {x: width / 2 - 63, y: height / 2 + 85, w: 135, h: 40},
  },
  mail: {x: width / 2 + 190, y: height / 2 - 135, w: 25, h: 25},
  mailIcon: {x: 30, y: height - 80, w: 50, h: 50}
};

function setup() {
  createCanvas(width, height);
}

function draw() {
  if (gameState == "start") drawStartScreen();
  else if (gameState == "usernameInput") drawUsernameInputScreen();
  else if (gameState == "play") playGame();
  else if (gameState == "infoCard") drawInfoCard();
  else if (gameState == "mail") drawMailLetter();

  if (mailArrived) drawMailAlertIcon();
   

  if (mailTimer > 0 && millis() > mailTimer) {
    mailArrived = true;
    newMail = true;
    mailTimer = 0;
  }
}

function mousePressed() {
  const clicks = {
    start: handleStartClick,
    usernameInput: handleUsernameInputClick,
    play: handlePlayClick,
    infoCard: handleInfoCardClick,
    mail: handleMailClick,
  };

  if (clicks[gameState]) {
    clicks[gameState]();
  }
}

function handleStartClick() {
  const b = buttonLayouts.start;
  
  if (isMouseInside(b.x, b.y, b.w, b.h)) {
    gameState = "usernameInput";
    usernameInputActive = true;
  }
}

function handleUsernameInputClick() {
  if (isMouseInside(width / 2 - 80, height / 2 + 100, 160, 60) && username.trim() !== "") {
    usernameInputActive = false;
    currentRanger = random(rangers);
    gameState = "play";
  }
}

function keyPressed() {
  if (gameState === "usernameInput" && usernameInputActive) {
    if (keyCode === BACKSPACE) username = username.slice(0, -1);
    else if (keyCode === ENTER && username.trim() !== "") {
      usernameInputActive = false;
      currentRanger = random(rangers);
      gameState = "play";
    }
  }
}

function keyTyped() {
  if (gameState === "usernameInput" && usernameInputActive) {
    if (key.length === 1) username += key;
  }
}


function handlePlayClick() {
  
  const left = arrowButtons.left;
  const right = arrowButtons.right;
  
  if (isMouseInside(left.x, left.y, left.w, left.h)) {
    currentLocation = (currentLocation - 1 + locations.length) % locations.length;
    respawnAnimals()
    return;
  }
  if (isMouseInside(right.x, right.y, right.w, right.h)) {
    currentLocation = (currentLocation + 1) % locations.length;
    respawnAnimals()
    return;
  } 
  
  for (let a of animals) {
    if (dist(mouseX, mouseY, a.x, a.y) < a.size / 2) {
      clickedAnimal = a;
      gameState = "infoCard";
      
      return;
    }
  }
  
  const b = buttonLayouts.mailIcon;

  if (mailArrived && isMouseInside(b.x, b.y, b.w, b.h)) {
    gameState = "mail";
    newMail = false;
    mailArrived = false;
  }
}

function handleInfoCardClick() {
  const exitB = buttonLayouts.infoCard.exit;
  const rangerB = buttonLayouts.infoCard.ranger;
  
  if (isMouseInside(exitB.x, exitB.y, exitB.w, exitB.h)) {
    clickedAnimal = null;
    gameState = "play";
  } 
  else if (isMouseInside(rangerB.x, rangerB.y, rangerB.w, rangerB.h)){
    handleMailLetter(clickedAnimal);
    clickedAnimal = null;
    gameState = "play";
  }
}

function handleMailClick() {
  const b = buttonLayouts.mail;
  
  if (isMouseInside(b.x, b.y, b.w, b.h)) {
    gameState = "play";
    mailMessage = null;
  }
}

function isMouseInside(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function playGame() {
  drawGameBackground();
  
  if (millis() > nextSpawnTime && animals.length < 3) {
    spawnAnimal();
    nextSpawnTime = millis() + random(8000, 12000);
  }

  for (let a of animals) {
    stroke(0);
    strokeWeight(2);
    a.display();
    
    if (dist(mouseX, mouseY, a.x, a.y) < a.size / 2) {
      showAnimalInfo(a);
    }
  }
}

function handleMailLetter(a) {
  animals = animals.filter(animal => animal !== a);
  
  let id = "311SR#: " + "311-" + floor(random(10000, 100000)) + "-" + floor(random(100, 1000));
  
  let action = null;
  let status = null;
  let condition = a.condition.toLowerCase();
  
  if (a.action == "Relocated") action = "has been safely relocated.";
  else if (a.action == "Taken to ACC") action = "has been safely\ntaken to the Animal Care Center.";
  else if (a.action == "Not Found") action = "was unable to be found.";
  else if (a.action == "Advised or Educated Others") action = "has been left undisturbed.\nThis provided a great opportunity to\neducate others on how to treat our\nfriends and their habitats with respect.";
  else if (a.action == "Monitored") action = "is currently being\nmonitored by fellow park rangers.";
  else if (a.action == "Rehabilitated") action = "is being rehabilitated by\nanimal caretakers.";
  else if (a.action == "Submitted for DEC Testing") action = "has been submitted for\nDEC testing.";
  
    if (a.status == "Native") status = `is native to New York, which you can spot year round! It\nis our duty to protect them and not disturb their natural habitat as\nbest we can. Good work ${username}!`
  else if (a.status == "Exotic") status = `is exotic and has found its way to New\nYork. While they might be fascinating to look at, it’s important to \nreport it, especially if you suspect it is being kept illegally without\nproper licensing. Good work ${username}!`
  else if (a.status == "Invasive") status = `is invasive and often competes with native\nspecies here in New York for resources. We must be mindful of\ntheir impact on local ecosystems and do our part to protect native \nwildlife. Good work ${username}!`;
  else if (a.status == "Domestic") status = `is domestic and often a pet! If you see\none wandering, it may be lost. Report them so they may be safely\nreunited with their family or taken to a local animal shelter.\nGood work ${username}!`;

  
  let text1 = `Hey ${username},\n\nJust wanted to let you know that the\n${a.species} you reported is\n${condition} and ${action}`;
  
  let text2 = `This ${a.species} ${status}`

  mailMessage = {
    id: id,
    text1: text1,
    text2: text2,
    animalData: a
  }
  
  rangerMessages.push(mailMessage);

  mailTimer = millis() + 10000;
}

function spawnAnimal() {
  let total = 0;
  for (let a of animalData) total += a.count;
  
  let r = random(total);
  let cumulative = 0;

  for (let a of animalData) {
    cumulative += a.count;
    
    if (r <= cumulative) {
      animals.push(new Animal(a));
      break;
    }
  }
}

function showAnimalInfo(a) {  
  let barWidth = 80;
  let barHeight = 10;

  let health = 0;
  let rarity = 0;
  
  if (a.condition == "Healthy") health = 1;
  else if (a.condition == "Injured" || a.condition == "Unhealthy") health = 0.5;
  else if (a.condition == "Dead on Arrival") health = 0;
  
  if (a.status === "Exotic") rarity = 1;
  else if (a.status === "Invasive") rarity = 0.75;
  else if (a.status === "Native") rarity = 0.5;
  else if (a.status === "Domestic") rarity = 0.25;

  stroke(0);
  strokeWeight(2);
  
  fill(200); 
  rect(a.x - barWidth / 2, a.y - a.size / 2 - 35, barWidth, barHeight, 5);
  
  textFont("Arial");
  fill("red");
  textSize(18);
  
  text("❤︎‬‬", a.x - barWidth / 2 - 20, a.y - a.size / 2 - 30);
  rect(a.x - barWidth / 2, a.y - a.size / 2 - 35, barWidth * health, barHeight, 5);

  fill(200); 
  rect(a.x - barWidth / 2, a.y - a.size / 2 - 15, barWidth, barHeight, 5);

  fill("gold");
  text("★", a.x - barWidth / 2 - 20, a.y - a.size / 2 - 10);
  rect(a.x - barWidth / 2, a.y - a.size / 2 - 15, barWidth * rarity, barHeight, 5);
  textFont(pixelfont);
}

function respawnAnimals() {
  animals = [];
  let initialSpawnCount = random(0, 3);
  
  for (let i = 0; i < initialSpawnCount; i++) {
    spawnAnimal();
  }

  nextSpawnTime = millis() + random(8000, 12000);
}

function drawStartScreen() {
  
  image(welcome, 0, 0 , width, height);

  fill(255, 255, 255, 150);
  rectMode(CENTER);
  rect(width / 2, height / 2 - 60, 310, 150);
  rect(width / 2, 400, 240, 50);
  
  
  rectMode(CORNER);
  
  textFont(pixelfont);
  textAlign(CENTER, CENTER);
  textSize(60);
  fill(0);
  text(`The Wild \nWild Life`, width / 2, height / 2 - 65);
  
  textAlign(CENTER, CENTER);
  textSize(25);
  fill(0);
  text(`Protect NYC's Wildlife!`, width / 2, height / 2 + 100);
  
  textSize(40);
  const b = buttonLayouts.start;
  drawButton(b.x, b.y, b.w, b.h, "Start");

  let textPulse = 30 + sin(millis() * 0.003) * 2
  
  
  //NYC banner
  translate(width - 350, 330);
  rotate(radians(-25));
  fill("yellow");
  rect(0, 0, 160, 50);
  fill(0);
  textSize(textPulse);
  textAlign(CENTER, CENTER);
  text(`NYC Edition`, 81, 21);
}

function drawUsernameInputScreen() {
  background(255);
  textFont(pixelfont);
  fill(0);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("Enter Your Name", width / 2, height / 2 - 50);

  fill(255);
  stroke(0);
  rect(width / 2 - 150, height / 2, 300, 50, 10);

  noStroke();
  fill(0);
  textSize(30);
  text(username || "Click To Type..", width / 2, height / 2 + 23); 

  drawButton(width / 2 - 80, height / 2 + 100, 160, 60, "Continue");
}

function drawGameBackground() {
  stroke(0);
  strokeWeight(2);
  
  if (locations.length > 0) image(locations[currentLocation], 0, 0, width, height);
  else background("white");
  
  drawArrowButtons();
}

function drawArrowButtons() {
  const left = arrowButtons.left;
  const right = arrowButtons.right;
  textSize(30);
  
  //left arrow
  fill(isMouseInside(left.x, left.y, left.w, left.h) ? "lightgrey" : "white");
  rect(left.x, left.y, left.w, left.h, 10);
  fill(0);
  textAlign(CENTER, CENTER);
  text("<", left.x + left.w / 2, left.y + left.h / 2 - 2);
  
  //right arrow
  fill(isMouseInside(right.x, right.y, right.w, right.h) ? "lightgrey" : "white")
  rect(right.x, right.y, right.w, right.h, 10);
  fill(0);
  text(">", right.x + right.w / 2, right.y + right.h / 2 - 2);
}


function drawInfoCard() {
  stroke(0);
  strokeWeight(2);
  fill("white")
  rect(width / 2 - 225, height / 2 - 150, 450, 300, 15);
  
  fill(202, 217, 237)
  rect(width / 2 - 200, height / 2 - 125, 150, 150, 15);

  clickedAnimal.display(width / 2 - 125, height / 2 - 50, 120);
  
  noStroke();
  fill(0);
  textFont(pixelfont);
  textSize(20);
  textAlign(LEFT, TOP);
  text(`Species: ${clickedAnimal.species}\n\nAnimal Class: ${clickedAnimal.animalClass}\n\nCondition: ${clickedAnimal.condition}`, width / 2 - 30, height / 2 - 100);
  
  const exitB = buttonLayouts.infoCard.exit;
  const rangerB = buttonLayouts.infoCard.ranger;
  
  noStroke();
  fill(isMouseInside(exitB.x, exitB.y, exitB.w, exitB.h) ? "red" : "black");
  textAlign(CENTER, CENTER);
  textSize(30);
  textFont("Arial");
  text("✘", exitB.x + exitB.w / 2, exitB.y + exitB.h / 2);
  
  noStroke();
  textSize(35);
  fill(0);
  text("🕻", rangerB.x - 20, rangerB.y + 23);
  textFont(pixelfont);
  
  textSize(23);
  drawButton(rangerB.x, rangerB.y, rangerB.w, rangerB.h, "Call Ranger?");
}

function drawMailLetter() {

  stroke(0);
  strokeWeight(2);
  fill("white")
  rect(width / 2 - 225, height / 2 - 150, 450, 315, 15);
  
  fill(202, 217, 237)
  rect(width / 2 - 200, height / 2 - 125, 150, 150, 15);

  let a = mailMessage.animalData;
  new Animal(a).display(width / 2 - 125, height / 2 - 50, 120);

  noStroke();
  fill(0);
  textSize(16)
  textAlign(LEFT, TOP);
  text(mailMessage.text1, width / 2 - 30, height / 2 - 115);

  text(mailMessage.text2, width / 2 - 200, height / 2 + 40);
  text(mailMessage.id, width / 2 - 200, height / 2 + 130);    

  const b = buttonLayouts.mail;

  noStroke();
  fill(isMouseInside(b.x, b.y, b.w, b.h) ? "red" : "black");
  textAlign(CENTER, CENTER);
  textSize(30);
  textFont("Arial");
  text("✘", b.x + b.w / 2, b.y + b.h / 2);
  textFont(pixelfont);
}


function drawRanger() {
  const b = buttonLayouts.mailIcon;
  
  stroke(0);
  fill(202, 217, 237);
  ellipse(b.x + b.w / 2, b.y + b.h / 2, 70, 70);
  
  imageMode(CENTER);
  image(currentRanger, b.x + b.w / 2, b.y + b.h / 2 - 3, 180, 180);
  imageMode(CORNER);
}


function drawMailAlertIcon() {
  stroke(0);
  strokeWeight(2);

  const b = buttonLayouts.mailIcon;
  const d = dist(mouseX, mouseY, b.x, b.y);
  
  drawRanger();

  noStroke();
  fill("red");
  textSize(45);
  textAlign(CENTER, CENTER);
  textFont("Arial");
  text("!", b.x + 50, b.y + 10);
  textFont(pixelfont);

}

function drawButton(x, y, w, h, label) {
  stroke(0);
  strokeWeight(2);
  fill(isMouseInside(x, y, w, h) ? color(202, 217, 237) : color(73, 110, 189));
  rect(x, y, w, h, 10);
  fill(0);
  
  noStroke();
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
}