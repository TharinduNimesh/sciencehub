<template>
    <Header />
    <AuroraBackground>
      <Hero />
    </AuroraBackground>
  
    <div id="features">
      <ImageGallery />
      <Ranking />
      <Features />
    </div>
    <div id="rewards">
      <Rewards />
    </div>
    <div id="about">
      <TeacherSection />
    </div>
    <div id="join-now">
      <JoinForm />
    </div>
    <Footer />
</template>
  
<script setup>
import AuroraBackground from "@/components/Inspira/AuroraBackground.vue";
import Header from "@/components/Landing/Header.vue";
import Hero from "@/components/Landing/Hero.vue";
import Features from "@/components/Landing/Features.vue";
import ImageGallery from "@/components/Landing/ImageGallery.vue";
import Ranking from "@/components/Landing/Ranking.vue";
import Rewards from "@/components/Landing/Rewards.vue";
import TeacherSection from "@/components/Landing/TeacherSection.vue";
import JoinForm from "@/components/Landing/JoinForm.vue";
import Footer from "@/components/Landing/Footer.vue";
import AOS from "aos";
import { onMounted } from "vue";

onMounted(() => {
  AOS.init();
});

useSeoMeta({
  title: 'ScienceHub - Advanced Science Education Platform',
  description: 'Join ScienceHub for an innovative learning experience in science education. Access quality resources, interactive lessons, and expert guidance from our lead tutor Chathura Nellampitiya.',
  ogImage: '/og-image.webp',
  twitterCard: 'summary_large_image',
})
</script>