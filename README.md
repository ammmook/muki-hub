<div align="center">

<img src="src/assets/bg-forest-900.webp" alt="Muki Hub forest" width="100%" />

# 🍃 Muki <em>Hub</em> 🍃

**แหล่งรวมเว็บของมุกกี้**
*one quiet clearing in the forest, where every site Muki has grown lives*

![React](https://img.shields.io/badge/React-18-55793a?style=for-the-badge&logo=react&logoColor=cdee6b&labelColor=0c1a12)
![Vite](https://img.shields.io/badge/Vite-5-55793a?style=for-the-badge&logo=vite&logoColor=cdee6b&labelColor=0c1a12)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20RTDB-55793a?style=for-the-badge&logo=firebase&logoColor=cdee6b&labelColor=0c1a12)
![Theme](https://img.shields.io/badge/theme-forest%20night-1f4a2f?style=for-the-badge&labelColor=0c1a12)

</div>

<br />

```
        🌿        🍃              🌿
   🍃        🌿        🍃    🌿        🍃
```

## 🌱 ทำไมถึงมีเว็บนี้

มุกกี้ทำเว็บไว้หลายตัว กระจายอยู่คนละโดเมน ลิงก์จำยาก และไม่มีที่ไหนให้เห็นภาพรวมว่า
ตอนนี้ตัวไหนใช้งานได้ ตัวไหนกำลังสร้าง ตัวไหนพักไว้

**Muki Hub** จึงเกิดขึ้นเป็น "ป่าเล็ก ๆ" หน้าเดียวที่รวมทุกเว็บไว้เป็นการ์ดใบไม้ เปิดได้ในคลิกเดียว
เรียงลำดับได้ตามใจ และให้เว็บที่สำคัญที่สุดเป็น *main* อยู่ต้นแถว

## 🍃 มีอะไรให้ใช้

| | |
|---|---|
| 🌿 **การ์ดเว็บ** | ลากเรียงลำดับได้ (เมาส์, สัมผัสค้างแล้วลาก, หรือคีย์บอร์ด) ใบแรกคือเว็บหลัก |
| 🍂 **สถานะ** | Live · Building · Paused บอกได้ทันทีว่าเว็บไหนอยู่ในช่วงไหน |
| 🌳 **Most used** | วงแหวน 3 มิติของเว็บที่ใช้บ่อย เลื่อนเพื่อหมุนดู |
| 🔐 **Google login** | เข้าด้วยบัญชี Google หรือเข้าแบบ guest เพื่อดูอย่างเดียว |
| ✏️ **จัดการ** | เจ้าของเท่านั้นที่เพิ่ม แก้ ลบ (มี Undo) และเปลี่ยนเว็บหลักได้ |
| 🧭 **เมนูลอยตามจอ** | แถบไฮไลต์เลื่อนไหลตามส่วนที่กำลังอ่านอยู่ |
| ⚡ **Realtime** | แก้ในเครื่องหนึ่ง อีกเครื่องเห็นทันที ไม่ต้องรีเฟรช |

## 🌲 สร้างขึ้นมาด้วยอะไร

| ชั้น | เทคโนโลยี | ทำไมเลือก |
|---|---|---|
| หน้าเว็บ | **React 18** + **React Router 6** | แบ่งหน้า `/` และ `/manage` ได้ง่าย อัปเดตหน้าจอตามข้อมูลสด |
| Build | **Vite 5** | เริ่มเร็ว รีโหลดทันที build เบา |
| ล็อกอิน | **Firebase Authentication** (Google, Anonymous) | ไม่ต้องทำระบบรหัสผ่านเอง |
| ฐานข้อมูล | **Firebase Realtime Database** | ซิงก์สดข้ามเครื่อง ไม่ต้องมีเซิร์ฟเวอร์ของตัวเอง |
| ดีไซน์ | **Forest Hub design system** + CSS เขียนเอง | ธีมใบไม้ โทนกลางคืน สีมอสกับเขียวมะนาว |
| ทดสอบ | **Vitest** + **ESLint** + **Prettier** | กันบั๊กตรงตรรกะเก็บข้อมูลและการเรียงลำดับ |
| CI | **GitHub Actions** | รัน lint, test, build ทุกครั้งที่ push |

## 🍁 ข้อมูลและสิทธิ์ทำงานยังไง

```
   ผู้ใช้ ──▶ Google / Guest ──▶ Firebase Auth ──▶ Realtime Database  /projects
                                                       ▲
                          กฎ (database.rules.json) ตัดสินที่เซิร์ฟเวอร์ Firebase
```

| ใคร | ดูเว็บ | เพิ่ม / แก้ / ลบ / เรียง |
|---|---|---|
| ยังไม่ login | ✖ | ✖ |
| Guest หรือบัญชี Google ทั่วไป | ✔ | ✖ |
| เจ้าของ (อีเมลที่กำหนด) | ✔ | ✔ |

การซ่อนปุ่มในหน้าเว็บเป็นแค่เรื่องความสวยงาม **ตัวกันจริงคือ Security Rules ฝั่ง Firebase**
ต่อให้ใครเปิด dev tools แล้วยิงคำสั่งเขียนเอง ก็ถูกปฏิเสธ
ค่า config ของ Firebase เปิดเผยได้ ไม่ใช่ความลับ ความปลอดภัยอยู่ที่กฎ ไม่ใช่ที่ key

## 🌿 เริ่มใช้

```bash
npm install
npm run dev        # http://localhost:5173
```

ถ้ายังไม่ใส่ค่า `VITE_FIREBASE_*` ใน `.env.local` แอปจะรันเป็น **demo mode**
(ล็อกอินปลอมในเครื่อง เก็บข้อมูลใน localStorage) เหมาะกับการลองเล่นโดยไม่ต้องมี Firebase

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run build` | build สำหรับ production ลงโฟลเดอร์ `dist/` |
| `npm run lint` | ตรวจโค้ดด้วย ESLint |
| `npm test` | รัน unit test |
| `npm run format` | ตรวจรูปแบบโค้ดด้วย Prettier |

ขั้นตอนตั้งค่า Firebase ทั้งหมด (สร้างโปรเจกต์ เปิด Google/Anonymous ใส่ rules) อยู่ใน [CLAUDE.md](CLAUDE.md)

## 🍃 โครงสร้างโปรเจกต์

```
src/
  main.jsx            เส้นทางหน้าเว็บ
  firebase.js         เริ่มต้น Firebase (demo mode ถ้ายังไม่ตั้งค่า)
  auth.jsx            Google / Guest login และแยกเจ้าของกับผู้ดู
  store.js            รายการเว็บ + hook useProjects() ซิงก์สด
  pages/              Home, Manage
  components/         Nav, SortableBoard, ForestScene, Modal, ...
  vendor/             Forest Hub design system
database.rules.json   กฎสิทธิ์ของ Realtime Database
```

<br />

<div align="center">

```
   🌿   grown with care by Muki   🌿
```

*ใบไม้ทุกใบคือเว็บหนึ่งเว็บ*

</div>
