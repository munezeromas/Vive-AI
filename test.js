import { parseOffice } from "officeparser";
try {
  const text = await parseOffice(Buffer.from([]), { fileType: 'docx' });
  console.log("Success:", text);
} catch (e) {
  console.log("Error as expected:", e.message);
}
