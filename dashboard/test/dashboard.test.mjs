// Checks the day sheet's script parses, and exercises the MIME code that
// pulls an attachment out of a RAW Gmail message. The page itself needs
// Claude's runtime, so only its pure functions are run here.
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
let failures = 0;
const check = (label, cond) => { console.log((cond ? "ok   " : "FAIL ") + label); if (!cond) failures++; };

try { new Function(script); check("page script parses", true); } catch (e) { check("page script parses: " + e.message, false); }

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

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
