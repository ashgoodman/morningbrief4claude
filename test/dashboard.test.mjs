// Checks the day sheet's script parses, exercises the MIME code that pulls
// an attachment out of a RAW Gmail message, and the free-time planner. The page itself needs
// Claude's runtime, so only its pure functions are run here.
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../plugin/skills/dashboard/day-sheet.html", import.meta.url), "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const script = scripts.at(-1);   // the page's main script; the first sets colours before it draws
let failures = 0;
const check = (label, cond) => { console.log((cond ? "ok   " : "FAIL ") + label); if (!cond) failures++; };

scripts.forEach((src, i) => {
  try { new Function(src); check(`page script ${i + 1} of ${scripts.length} parses`, true); } catch (e) { check(`page script ${i + 1} parses: ` + e.message, false); }
});

const src = script.slice(script.indexOf("function b64ToBinary"), script.indexOf("async function saveAttachment"));
const f = new Function(src + "\nreturn { b64ToBinary, mimeTree, findPart, partFilename, partBytes };")();

const pdf = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.from([0, 1, 2, 250, 251, 252, 253, 254, 255]), Buffer.from("\n%%EOF")]);
const mime = [
  "MIME-Version: 1.0", 'Content-Type: multipart/mixed; boundary="OUTER"', "", "--OUTER",
  "Content-Type: multipart/alternative; boundary=INNER", "", "--INNER", "Content-Type: text/plain", "", "hello", "--INNER",
  "Content-Type: text/html", "", "<p>hello</p>", "--INNER--", "", "--OUTER",
  'Content-Type: application/pdf; name="Invoice 42.pdf"', "Content-Disposition: attachment;", ' filename="Invoice 42.pdf"',
  "Content-Transfer-Encoding: base64", "", pdf.toString("base64").replace(/(.{76})/g, "$1\r\n"), "--OUTER",
  'Content-Type: text/csv; name="a.csv"', 'Content-Disposition: attachment; filename="a.csv"',
  "Content-Transfer-Encoding: quoted-printable", "", "x=3D1,y=3D=\r\n2", "--OUTER--", "",
].join("\r\n");
const tree = f.mimeTree(f.b64ToBinary(Buffer.from(mime, "latin1").toString("base64url")), "");

check("top level has three parts", tree.children.length === 3);
check("nested parts numbered like Gmail (0.1)", f.findPart(tree, "0.1")?.type === "text/html");
const p = f.findPart(tree, "1");
check("part 1 is the PDF, folded filename read", p?.type === "application/pdf" && f.partFilename(p) === "Invoice 42.pdf");
check("PDF bytes survive intact", Buffer.from(f.partBytes(p)).equals(pdf));
check("quoted-printable decodes", Buffer.from(f.partBytes(f.findPart(tree, "2"))).toString() === "x=1,y=2");

// Free time, the day planner and the start of the week.
const line = (name) => {
  const m = script.match(new RegExp(`^(?:function ${name}\\(|const ${name} = ).*$`, "m"));
  if (!m) throw new Error("missing " + name);
  return m[0];
};
const pure = script.slice(script.indexOf("// ---- pure: free time"), script.indexOf("// ---- pure: end"));
const helpers = ["localDay", "addDays", "dayStart", "evStart", "evEnd", "evAllDay", "effPrio", "isSnoozed", "isOpen", "BLOCK_PREFIX", "BLOCK_NOTE"].map(line).join("\n");
const g = new Function(helpers + "\n" + pure + "\nreturn { freeRanges, planBlocks, planTasks, weekStartOf, dayStart, isBlockEvent, BLOCK_NOTE };")();

const at = (day, hm) => { const d = g.dayStart(day); const [a, b] = hm.split(":").map(Number); d.setHours(a, b, 0, 0); return d.getTime(); };
const hm = (ms) => new Date(ms).toTimeString().slice(0, 5);
const ev = (day, from, to, extra = {}) => ({ start: { dateTime: new Date(at(day, from)).toISOString() }, end: { dateTime: new Date(at(day, to)).toISOString() }, ...extra });
const DAY = "2026-10-06", BEFORE = at("2026-10-05", "12:00");
const events = [ev(DAY, "10:00", "11:00"), ev(DAY, "13:00", "14:00"), ev(DAY, "15:00", "16:00", { transparency: "transparent" }), { start: { date: DAY }, end: { date: "2026-10-07" } }];
const ranges = g.freeRanges(DAY, events, "09:00", "18:00", BEFORE);
check("free time keeps 10 minutes clear of meetings", ranges.map(([a, b]) => hm(a) + "-" + hm(b)).join(" ") === "09:00-09:50 11:10-12:50 14:10-18:00");
check("free time starts from now, rounded to 15 minutes", hm(g.freeRanges(DAY, events, "09:00", "18:00", at(DAY, "11:07"))[0][0]) === "11:15");
check("no free time on a day that has passed", g.freeRanges("2026-10-04", [], "09:00", "18:00", BEFORE).length === 0);

const plan = g.planBlocks([{ key: "a", minutes: 60 }, { key: "b", minutes: 30 }, { key: "c", minutes: 120 }, { key: "d", minutes: 240 }], ranges);
const where = Object.fromEntries(plan.placed.map((p) => [p.key, hm(p.start) + "-" + hm(p.end)]));
check("planner puts each block in the earliest gap it fits", where.a === "11:10-12:10" && where.b === "09:00-09:30" && where.c === "14:10-16:10");
check("planner reports what doesn't fit", plan.unplaced.length === 1 && plan.unplaced[0].key === "d");
check("planner leaves 10 minutes between its own blocks", g.planBlocks([{ key: "x", minutes: 30 }, { key: "y", minutes: 30 }], [[at(DAY, "09:00"), at(DAY, "12:00")]]).placed.map((p) => hm(p.start)).join() === "09:00,09:40");

const item = (id, extra) => ({ id, status: "open", kind: "inbound", priority: 2, receivedAt: 1, tags: [], ...extra });
const tasks = g.planTasks([
  item("w1", { tags: ["work"], estimateMin: 15, priority: 2 }),
  item("w2", { tags: ["work", "call_back"], estimateMin: 90, priority: 1 }),
  item("c1", { tags: ["call_back"], priority: 3, who: "Ana" }), item("c2", { tags: ["call_back"], priority: 2, who: "Ben" }),
  item("booked", { tags: ["work"], blockStart: at(DAY, "09:00") }),
  item("noise", { tags: ["work"], priority: 4 }), item("done", { tags: ["work"], status: "done" }),
], at("2026-10-05", "00:00"));
check("plan: highest priority first, calls grouped", tasks.map((t) => t.key).join() === "w2,w1,calls");
check("plan: blocks are 30 minutes to 2 hours; calls 15 + 5 each", tasks[1].minutes === 30 && tasks[0].minutes === 90 && tasks[2].minutes === 30 && tasks[2].ids.length === 2);

check("week starting Monday: Wed 30 Sep 2026 -> Mon 28 Sep", g.weekStartOf("2026-09-30", 1) === "2026-09-28");
check("week starting Sunday: Wed 30 Sep 2026 -> Sun 27 Sep", g.weekStartOf("2026-09-30", 0) === "2026-09-27");
check("week starting on the day itself", g.weekStartOf("2026-09-30", 3) === "2026-09-30");

const ids = new Set(["booked-here"]);
check("block: remembered by its id", g.isBlockEvent({ id: "booked-here", summary: "Draft quote" }, ids));
check("block: marked in its description", g.isBlockEvent({ id: "x", summary: "Draft quote", description: g.BLOCK_NOTE + "\n\nFrom: Sam" }, ids));
check("block: older 'MB4C: ' title still counts", g.isBlockEvent({ id: "y", summary: "MB4C: Draft quote" }, ids));
check("block: an ordinary event is not one", !g.isBlockEvent({ id: "z", summary: "Team stand-up", description: "Weekly" }, ids));

const pa = new Function(script.slice(script.indexOf("function parseAddresses"), script.indexOf("function openNewEmail")) + "\nreturn parseAddresses;")();
const addr = pa('Dr Reyes <reyes@clinic.ph>, sam@example.com; not-an-address');
check("email: reads plain and named addresses", addr.out.join() === "reyes@clinic.ph,sam@example.com");
check("email: reports what isn't an address", addr.bad.length === 1 && addr.bad[0] === "not-an-address");

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
