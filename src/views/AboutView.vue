<template>
  <article class="about">
    <div class="about__inner">
      <header class="about__hero">
        <p class="about__label"><span class="about__lamp" aria-hidden="true" />Fiche technique</p>
        <h1 class="about__title">FOLIO 400</h1>
        <p class="about__intro">
          Une planche contact pour ses références visuelles. On y développe des images, on les numérote, on entoure celles
          qui comptent. Pour penser, pas pour partager.
        </p>
      </header>

      <section class="about__section" aria-labelledby="about-why">
        <h2 id="about-why" class="about__section-title"><span>01</span>Pourquoi</h2>
        <p class="about__text">
          J’ai regardé ce qui existait avant de commencer. Aucun outil ne correspondait à ce que je cherchais : quelque
          chose de simple, rapide, sans compte et sans algorithme.
        </p>
        <ul class="about__compare">
          <li v-for="tool in tools" :key="tool.name" class="about__compare-item">
            <span class="about__compare-name">{{ tool.name }}</span>
            <span class="about__compare-tag">{{ tool.label }}</span>
            <p class="about__compare-desc">{{ tool.desc }}</p>
          </li>
          <li class="about__compare-item about__compare-item--ours">
            <span class="about__compare-name">Folio</span>
            <span class="about__compare-tag about__compare-tag--ours">mon approche</span>
            <p class="about__compare-desc">Minimaliste, local, sans friction. Une planche à soi, rien d’autre.</p>
          </li>
        </ul>
      </section>

      <section class="about__section" aria-labelledby="about-specs">
        <h2 id="about-specs" class="about__section-title"><span>02</span>Caractéristiques</h2>
        <dl class="about__specs">
          <div v-for="spec in specs" :key="spec.label" class="about__spec">
            <dt class="about__spec-label">{{ spec.label }}</dt>
            <dd class="about__spec-value">{{ spec.value }}</dd>
          </div>
        </dl>
      </section>

      <section class="about__section" aria-labelledby="about-stack">
        <h2 id="about-stack" class="about__section-title"><span>03</span>Composition</h2>
        <ul class="about__stack">
          <li v-for="tech in stack" :key="tech" class="about__stack-item">{{ tech }}</li>
        </ul>
      </section>

      <RouterLink :to="{ name: 'home' }" class="about__back">← retour à la planche</RouterLink>
    </div>
  </article>
</template>

<script setup lang="ts">
interface Tool {
  name: string
  label: string
  desc: string
}

interface Spec {
  label: string
  value: string
}

const tools: Tool[] = [
  { name: 'Pinterest', label: 'social', desc: 'Trop orienté partage et algorithme. Pas adapté à un usage privé.' },
  { name: 'Notion', label: 'complexe', desc: 'Trop générique. Surdimensionné pour juste organiser des visuels.' },
  { name: 'Are.na', label: 'communautaire', desc: 'Proche de l’idée, mais l’aspect réseau social reste présent.' }
]

const specs: Spec[] = [
  { label: 'Format', value: 'Vues 3:2 numérotées dans l’ordre de développement' },
  { label: 'Sélection', value: 'Entourer une vue au crayon gras, filtrer sur la sélection' },
  { label: 'Tri', value: 'Tags personnalisés et recherche instantanée' },
  { label: 'Stockage', value: 'Dans le navigateur, sans compte ni serveur' },
  { label: 'Archivage', value: 'Export et import JSON pour sauvegarder ou transférer' },
  { label: 'Accès', value: 'Navigation clavier, lecteurs d’écran, animations réduites' }
]

const stack: string[] = ['Vue.js 3', 'TypeScript', 'Pinia', 'Vue Router', 'Vite', 'SCSS', 'localStorage']
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.about {
  padding: 56px 0 80px;

  @media (max-width: 600px) {
    padding: 36px 0 60px;
  }
}

.about__inner {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.about__hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about__label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: $font-mono;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $edge;
}

.about__lamp {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $accent;
  box-shadow: 0 0 8px $accent;
}

.about__title {
  font-family: $font-mono;
  font-size: clamp(40px, 9vw, 84px);
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1;
  color: $text-primary;
}

.about__intro {
  max-width: 560px;
  font-size: 16px;
  line-height: 1.65;
  color: $text-secondary;
}

.about__section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.about__section-title {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid $border;
  font-family: $font-mono;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $text-primary;

  span {
    color: $edge;
  }
}

.about__text {
  font-size: 14px;
  line-height: 1.7;
  color: $text-secondary;
}

.about__compare {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
}

.about__compare-item {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 6px 10px;
  padding: 14px 16px;
  border: 1px solid $border;
  border-radius: $radius;
  background: $surface;

  &--ours {
    border-color: rgba(210, 52, 88, 0.5);
    background: rgba(210, 52, 88, 0.08);
  }
}

.about__compare-name {
  font-size: 13px;
  font-weight: 500;
  color: $text-primary;
}

.about__compare-tag {
  justify-self: start;
  font-family: $font-mono;
  font-size: 10px;
  padding: 2px 8px;
  border: 1px solid $border;
  border-radius: 999px;
  color: $text-muted;

  &--ours {
    color: $accent;
    border-color: $accent;
  }
}

.about__compare-desc {
  grid-column: 1 / -1;
  font-size: 13px;
  line-height: 1.5;
  color: $text-secondary;
}

.about__specs {
  display: flex;
  flex-direction: column;
}

.about__spec {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  padding: 14px 0;
  border-bottom: 1px dashed $border;

  @media (min-width: 600px) {
    grid-template-columns: 160px 1fr;
    gap: 24px;
  }
}

.about__spec-label {
  font-family: $font-mono;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $text-muted;
}

.about__spec-value {
  font-size: 14px;
  color: $text-primary;
}

.about__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.about__stack-item {
  font-family: $font-mono;
  font-size: 12px;
  padding: 6px 12px;
  border: 1px solid $border;
  border-radius: 999px;
  color: $text-secondary;
}

.about__back {
  align-self: flex-start;
  font-family: $font-mono;
  font-size: 13px;
  color: $text-secondary;
  text-decoration: none;
  transition: color $duration $ease;

  &:hover,
  &:focus-visible {
    color: $accent;
  }
}
</style>