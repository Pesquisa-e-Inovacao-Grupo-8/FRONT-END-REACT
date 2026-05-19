//src/pages/Home.jsx
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import Services from "../components/home/Services";
import CTA from "../components/home/CTA";
import "../styles/home.css";

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <Services />
      <CTA />
    </main>
  );
}