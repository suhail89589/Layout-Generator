

const CONFIG = {
  SCALE: 4,
  SITE: { w: 200, h: 140 },
  PLAZA: { x: 80, y: 50, w: 40, h: 40 },
  SETBACK: 10,
  MIN_DIST: 15,
  NEIGHBOR_DIST: 60,
  TARGET_COUNT: 50, 
  MAX_ATTEMPTS: 3000, 
  BUILDINGS: {
    A: { w: 30, h: 20, area: 600, color: "#2563eb", label: "A" },
    B: { w: 20, h: 20, area: 400, color: "#16a34a", label: "B" },
  },
};


const MIN_DIST_SQ = CONFIG.MIN_DIST ** 2;
const NEIGHBOR_DIST_SQ = CONFIG.NEIGHBOR_DIST ** 2;

class LayoutEngine {
  constructor() {
    this.buildings = [];
  }

  /**
  
   * @returns {number} 
   */
  getDistanceSq(r1, r2) {
   
    const dx = Math.max(r1.x - (r2.x + r2.w), r2.x - (r1.x + r1.w), 0);
    const dy = Math.max(r1.y - (r2.y + r2.h), r2.y - (r1.y + r1.h), 0);
    return dx * dx + dy * dy;
  }

  isValid(rect) {
 
    if (
      rect.x < CONFIG.SETBACK ||
      rect.y < CONFIG.SETBACK ||
      rect.x + rect.w > CONFIG.SITE.w - CONFIG.SETBACK ||
      rect.y + rect.h > CONFIG.SITE.h - CONFIG.SETBACK
    )
      return false;

   
    const intersectsPlaza = !(
      rect.x + rect.w <= CONFIG.PLAZA.x ||
      rect.x >= CONFIG.PLAZA.x + CONFIG.PLAZA.w ||
      rect.y + rect.h <= CONFIG.PLAZA.y ||
      rect.y >= CONFIG.PLAZA.y + CONFIG.PLAZA.h
    );
    if (intersectsPlaza) return false;

    
    for (const b of this.buildings) {
      if (this.getDistanceSq(rect, b) < MIN_DIST_SQ) return false;
    }

    return true;
  }

  generate() {
    this.buildings = [];
    let attempts = 0;

   
    while (
      this.buildings.length < CONFIG.TARGET_COUNT &&
      attempts < CONFIG.MAX_ATTEMPTS
    ) {
      attempts++;

     
      const type = Math.random() > 0.4 ? "A" : "B";
      const template = CONFIG.BUILDINGS[type];

      const rect = {
        type,
        w: template.w,
        h: template.h,
        area: template.area,
       
        x: Math.random() * (CONFIG.SITE.w - template.w),
        y: Math.random() * (CONFIG.SITE.h - template.h),
      };

      if (this.isValid(rect)) {
        this.buildings.push(rect);
      }
    }

    return this.buildings;
  }

  checkNeighborRule() {
    const towersA = this.buildings.filter((b) => b.type === "A");
    const towersB = this.buildings.filter((b) => b.type === "B");

    if (towersA.length === 0) return true; 

   
    return towersA.every((a) =>
      towersB.some((b) => this.getDistanceSq(a, b) <= NEIGHBOR_DIST_SQ)
    );
  }
}



const engine = new LayoutEngine();
const canvas = document.getElementById("siteCanvas");
const ctx = canvas.getContext("2d");


const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};


const setStatus = (id, passed) => {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = passed ? "PASS" : "FAIL";
    el.className = `status ${passed ? "pass" : "fail"}`;
  }
};

function drawLayout(buildings) {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

 
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    0,
    0,
    CONFIG.SITE.w * CONFIG.SCALE,
    CONFIG.SITE.h * CONFIG.SCALE
  );

 
  ctx.fillStyle = "#e2e8f0"; 
  ctx.fillRect(
    CONFIG.PLAZA.x * CONFIG.SCALE,
    CONFIG.PLAZA.y * CONFIG.SCALE,
    CONFIG.PLAZA.w * CONFIG.SCALE,
    CONFIG.PLAZA.h * CONFIG.SCALE
  );
 
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "PLAZA",
    (CONFIG.PLAZA.x + 20) * CONFIG.SCALE,
    (CONFIG.PLAZA.y + 22) * CONFIG.SCALE
  );

  
  buildings.forEach((b) => {
    const x = b.x * CONFIG.SCALE;
    const y = b.y * CONFIG.SCALE;
    const w = b.w * CONFIG.SCALE;
    const h = b.h * CONFIG.SCALE;

    ctx.fillStyle = CONFIG.BUILDINGS[b.type].color;
    ctx.fillRect(x, y, w, h);

    
    ctx.fillStyle = "white";
    ctx.font = "12px sans-serif";
    ctx.fillText(b.type, x + w / 2, y + h / 2 + 4);
  });
}

function runGeneration() {
  const buildings = engine.generate();
  const neighborRulePassed = engine.checkNeighborRule();

 
  const countA = buildings.filter((b) => b.type === "A").length;
  const countB = buildings.filter((b) => b.type === "B").length;
  const totalArea = buildings.reduce((sum, b) => sum + b.area, 0);

  setText("countA", countA);
  setText("countB", countB);
  setText("totalArea", totalArea.toLocaleString());

  
  setStatus("rule1", true); 
  setStatus("rule2", true);
  setStatus("rule3", true); 
  setStatus("rule4", neighborRulePassed);

  drawLayout(buildings);
}


document.getElementById("generateBtn").addEventListener("click", runGeneration);


runGeneration();
