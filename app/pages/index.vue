<template>
    <Header />
    <AuroraBackground>
      <Hero />
    </AuroraBackground>
  
    <div id="features">
      <ImageGallery />
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
import Rewards from "@/components/Landing/Rewards.vue";
import TeacherSection from "@/components/Landing/TeacherSection.vue";
import JoinForm from "@/components/Landing/JoinForm.vue";
import Footer from "@/components/Landing/Footer.vue";
import AOS from "aos";
import { onMounted } from "vue";
  
onMounted(() => {
  AOS.init();
});
</script>