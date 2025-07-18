# 📊 Système de Tracking QR Code - QRMaster

## Vue d'ensemble

Ce système de tracking permet de collecter des analytics détaillées sur l'utilisation des QR codes, incluant la géolocalisation, les appareils utilisés, les navigateurs, et l'activité en temps réel.

## 🏗️ Architecture

### 1. Génération avec Tracking
- **Avant** : QR codes générés avec l'URL directe (ex: `https://facebook.com`)
- **Maintenant** : QR codes générés avec URL de tracking (ex: `https://yourapp.com/scan/123`)

### 2. Base de données
Table `qr_scans` qui enregistre :
- `qrcode_id` : ID du QR code scanné
- `campaign_id` : ID de la campagne associée
- `scanned_at` : Timestamp du scan
- `ip_address` : Adresse IP du scanner
- `user_agent` : User Agent du navigateur
- `country` / `city` : Géolocalisation
- `device_type` : Desktop/Mobile/Tablet
- `browser` : Chrome/Firefox/Safari/etc
- `referrer` : Page de provenance

### 3. Flux de tracking

```
QR Code scanné → /scan/[id] → Collecte données → Base de données → Redirection
```

## 📁 Structure des fichiers

### `/pages/scan/[id].vue`
Route de tracking qui :
- Récupère les infos du QR code
- Collecte les données de tracking
- Enregistre le scan en base
- Redirige vers l'URL finale

### `/composables/useQRTracking.ts`
Fonctions utilitaires :
- `parseUserAgent()` : Détecte appareil et navigateur
- `getLocationFromIP()` : Géolocalisation via IP
- `recordScan()` : Enregistre un scan
- `getQRCodeAnalytics()` : Analytics d'un QR code
- `getGlobalAnalytics()` : Analytics globales

### `/utils/qrcode.ts`
Utilitaires de génération :
- `generateQRCodeWithTracking()` : Génère QR avec tracking
- `getTrackingUrl()` : Crée l'URL de tracking
- `copyTrackingUrlToClipboard()` : Copie URL tracking

### `/components/AnalyticsSection.vue`
Interface analytics complète avec :
- Métriques globales
- Onglets par catégorie
- Graphiques de tendance
- Données en temps réel

## 🚀 Utilisation

### Créer un QR Code avec tracking

```vue
<script setup>
const { generateQRCodeWithTracking } = useQRTracking()

// Le QR code sera automatiquement généré avec l'URL de tracking
const qrCodeImage = await generateQRCodeWithTracking(qrcodeId, {
  width: 256,
  margin: 2
})
</script>
```

### Récupérer les analytics

```vue
<script setup>
const { getGlobalAnalytics } = useQRTracking()

const analytics = await getGlobalAnalytics(userId)
// Returns: totalScans, uniqueVisitors, topCountries, deviceBreakdown, etc.
</script>
```

## 📊 Données collectées

### Automatiquement
- **Timestamp** : Date/heure du scan
- **Géolocalisation** : Pays et ville via IP
- **Appareil** : Desktop/Mobile/Tablet
- **Navigateur** : Chrome/Firefox/Safari/etc
- **Système** : iOS/Android/Windows/etc
- **Referrer** : Site de provenance

### Calculées
- **Visiteurs uniques** : Basé sur les IP
- **Taux de conversion** : Unique visitors / Total scans
- **Tendances** : Évolution dans le temps
- **Top performances** : Meilleurs QR codes/campagnes

## 🔧 Configuration

### Variables d'environnement

```bash
# URL de base pour les liens de tracking
NUXT_PUBLIC_BASE_URL=https://votre-domaine.com
```

### Runtime Config (nuxt.config.ts)

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }
  }
})
```

## 🎯 Fonctionnalités Analytics

### Vue d'ensemble
- Total QR codes créés
- Total scans
- Visiteurs uniques
- Taux de conversion
- QR codes les plus performants
- Performance par campagne

### Appareils & Navigateurs
- Répartition Desktop/Mobile/Tablet
- Navigateurs les plus utilisés
- Graphiques en barres avec pourcentages

### Géolocalisation
- Top 10 des pays
- Top 10 des villes
- Pourcentages par localisation

### Activité récente
- Liste des derniers scans
- Détails par scan (pays, appareil, navigateur)
- Timestamps formatés

## 🔒 Sécurité & Performance

### Sécurité
- Validation des IDs de QR code
- Sanitization des données User-Agent
- Rate limiting sur les scans (recommandé)

### Performance
- Enregistrement async des scans
- Cache des données analytics
- Requêtes optimisées avec indexation

### Respect de la vie privée
- Pas de stockage de données personnelles
- IP hashées (optionnel)
- Conformité RGPD

## 🚀 Déploiement

### Variables à configurer en production
```bash
NUXT_PUBLIC_BASE_URL=https://votre-domaine.com
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-publique
```

### Optimisations
- CDN pour les images QR code
- Cache Redis pour les analytics
- Compression des données historiques

## 📈 Métriques disponibles

### Globales
- `totalScans` : Nombre total de scans
- `uniqueVisitors` : Visiteurs uniques
- `topCountries` : Top pays
- `deviceBreakdown` : Répartition par appareil
- `scanTrend` : Tendance par date

### Par QR Code
- `scansByCountry` : Scans par pays
- `scansByDevice` : Scans par appareil
- `recentScans` : Activité récente
- `conversionRate` : Taux de conversion

## 🐛 Debug & Monitoring

### Logs
- Erreurs de tracking dans la console
- Métriques de performance
- Alertes sur les échecs de géolocalisation

### Tests
```bash
# Tester l'URL de tracking
curl https://votre-domaine.com/scan/123

# Vérifier les analytics
curl -X POST https://votre-domaine.com/api/analytics
```

## 🔄 Migration des QR codes existants

Pour migrer les QR codes existants vers le système de tracking :

1. **Backup** : Sauvegarder les QR codes actuels
2. **Régénération** : Utiliser `generateQRCodeWithTracking()`
3. **Test** : Vérifier que les redirections fonctionnent
4. **Déploiement** : Remplacer progressivement les anciens QR codes

## 📞 Support

Pour toute question sur le système de tracking :
- Consulter les logs d'erreur dans la console
- Vérifier la configuration des variables d'environnement
- Tester les URLs de tracking manuellement 