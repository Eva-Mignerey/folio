<template>
  <article class="about">
    <div class="about__inner">

      <div class="about__hero">
        <span class="about__label">À propos</span>
        <h1 class="about__title">Un espace pour penser,<br>pas pour partager.</h1>
        <p class="about__intro">Un outil de curation visuelle pour usage personnel. Centraliser ses références et inspirations dans une interface claire, sans compte, sans algorithme.</p>
      </div>

      <div class="about__section">
        <h2 class="about__section-title">Pourquoi cet outil ?</h2>
        <p class="about__text">J'ai regardé ce qui existait avant de commencer. Aucun outil ne correspondait vraiment à ce que je cherchais : quelque chose de simple, rapide, et complètement privé.</p>
        <ul class="about__compare">
          <li v-for="tool in tools" :key="tool.name" class="about__compare-item">
            <div class="about__compare-header">
              <span class="about__compare-name">{{ tool.name }}</span>
              <span class="about__compare-tag">{{ tool.label }}</span>
            </div>
            <p class="about__compare-desc">{{ tool.desc }}</p>
          </li>
          <li class="about__compare-item about__compare-item--ours">
            <div class="about__compare-header">
              <span class="about__compare-name">Folio</span>
              <span class="about__compare-tag about__compare-tag--ours">mon approche</span>
            </div>
            <p class="about__compare-desc">Minimaliste, local, sans friction. Pensé pour réfléchir, pas pour diffuser.</p>
          </li>
        </ul>
      </div>

      <div class="about__section">
        <h2 class="about__section-title">Fonctionnalités</h2>
        <ul class="about__features">
          <li v-for="feature in features" :key="feature.title" class="about__feature">
            <h3 class="about__feature-title">{{ feature.title }}</h3>
            <p class="about__feature-desc">{{ feature.desc }}</p>
          </li>
        </ul>
      </div>

      <div class="about__section">
        <h2 class="about__section-title">Stack</h2>
        <ul class="about__stack">
          <li v-for="tech in stack" :key="tech" class="about__stack-item">{{ tech }}</li>
        </ul>
      </div>

      <RouterLink :to="{ name: 'home' }" class="about__back">← retour</RouterLink>

    </div>
  </article>
</template>

<script setup lang="ts">
interface Tool {
  name: string
  label: string
  desc: string
}

interface Feature {
  title: string
  desc: string
}

const tools: Tool[] = [
  { name: 'Pinterest', label: 'social', desc: 'Trop orienté partage et algorithme. Pas adapté à un usage privé.' },
  { name: 'Notion', label: 'complexe', desc: 'Trop générique. Surdimensionné pour juste organiser des visuels.' },
  { name: 'Are.na', label: 'communautaire', desc: "Proche de l'idée mais l'aspect réseau social reste présent." }
]

const features: Feature[] = [
  { title: 'Ajout rapide', desc: 'Titre, image, description, tags en quelques secondes.' },
  { title: 'Filtres & recherche', desc: 'Tags personnalisés et recherche textuelle instantanée.' },
  { title: '100% local', desc: 'Aucun compte. Tout reste dans le navigateur.' },
  { title: 'Export / Import JSON', desc: "Les données peuvent sortir et entrer pour s'interfacer avec d'autres outils." }
]

const stack: string[] = ['Vue.js 3', 'TypeScript', 'Pinia', 'Vue Router', 'Vite', 'SCSS', 'localStorage']
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.about {
  padding: 48px 24px 80px;

  @media (max-width: 600px) {
    padding: 32px 16px 60px;
  }
}

.about__inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 52px;
}

.about__hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about__label {
  font-family: $font-mono;
  font-size: 11px;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.about__title {
  font-size: clamp(26px, 4vw, 38px);
  font-weight: 500;
  color: $text-primary;
  line-height: 1.2;
}

.about__intro {
  font-size: 15px;
  color: $text-secondary;
  line-height: 1.65;
}

.about__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about__section-title {
  font-size: 11px;
  font-family: $font-mono;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-bottom: 12px;
  border-bottom: 1px solid $border;
}

.about__text {
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.65;
}

.about__compare {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border: 1px solid $border;
}

.about__compare-item {
  padding: 14px 16px;
  background: $surface;
  display: flex;
  flex-direction: column;
  gap: 5px;

  &--ours {
    background: $bg;
    border-top: 1px solid $border;
  }
}

.about__compare-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.about__compare-name {
  font-size: 13px;
  font-weight: 500;
  color: $text-primary;
}

.about__compare-tag {
  font-size: 10px;
  font-family: $font-mono;
  padding: 2px 7px;
  border: 1px solid $border;
  color: $text-muted;

  &--ours {
    color: $accent;
    border-color: $accent;
  }
}

.about__compare-desc {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.5;
}

.about__features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  border: 1px solid $border;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.about__feature {
  padding: 14px 16px;
  background: $surface;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.about__feature-title {
  font-size: 13px;
  font-weight: 500;
  color: $text-primary;
}

.about__feature-desc {
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.5;
}

.about__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.about__stack-item {
  font-family: $font-mono;
  font-size: 11px;
  padding: 4px 10px;
  border: 1px solid $border;
  color: $text-secondary;
  background: $surface;
}

.about__back {
  font-size: 13px;
  font-family: $font-mono;
  color: $text-secondary;
  text-decoration: none;
  transition: color $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
  }
}
</style>