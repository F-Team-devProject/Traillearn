# Guide de Contribution - Coach&Pro'Talent

## 🤝 Bienvenue !

Merci de votre intérêt pour contribuer au projet Coach&Pro'Talent ! Ce guide vous aidera à comprendre comment contribuer efficacement au projet.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Processus de développement](#processus-de-développement)
- [Standards de code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)
- [Questions et support](#questions-et-support)

## 📜 Code de conduite

### Notre engagement

Nous nous engageons à offrir un environnement accueillant et inclusif pour tous, indépendamment de l'âge, de la taille, du handicap, de l'ethnicité, de l'identité et de l'expression de genre, du niveau d'expérience, de la nationalité, de l'apparence personnelle, de la race, de la religion ou de l'orientation sexuelle.

### Comportements attendus

- Utiliser un langage accueillant et inclusif
- Respecter les points de vue et expériences différents
- Accepter gracieusement les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres de la communauté

### Comportements inacceptables

- L'utilisation de langage ou d'images sexualisés
- Le trolling, les commentaires insultants ou désobligeants
- Le harcèlement public ou privé
- La publication d'informations privées sans permission
- Toute conduite inappropriée dans un contexte professionnel

## 🚀 Comment contribuer

### Types de contributions

1. **Rapports de bugs** : Signaler des problèmes
2. **Suggestions d'améliorations** : Proposer de nouvelles fonctionnalités
3. **Corrections de bugs** : Corriger des problèmes existants
4. **Nouvelles fonctionnalités** : Ajouter de nouvelles capacités
5. **Documentation** : Améliorer la documentation
6. **Tests** : Ajouter ou améliorer les tests

### Processus de contribution

1. **Fork** le repository
2. **Clone** votre fork localement
3. **Créez** une branche pour votre fonctionnalité
4. **Commitez** vos changements
5. **Pushez** vers votre fork
6. **Ouvrez** une Pull Request

## 🔧 Processus de développement

### Configuration de l'environnement

```bash
# 1. Fork et clone du repository
git clone https://github.com/votre-username/platform.git
cd platform

# 2. Installation des dépendances
npm install

# 3. Configuration de l'environnement
cp env.example .env
# Éditer .env avec vos configurations

# 4. Démarrage des services
docker-compose up -d

# 5. Migration de la base de données
npm run db:migrate

# 6. Démarrage du développement
npm run dev
```

### Workflow Git

#### Branches

- `main` : Branche principale (production)
- `develop` : Branche de développement
- `feature/*` : Nouvelles fonctionnalités
- `bugfix/*` : Corrections de bugs
- `hotfix/*` : Corrections urgentes
- `release/*` : Préparation des releases

#### Convention de nommage des branches

```bash
# Fonctionnalités
feature/user-authentication
feature/ai-recommendations
feature/mentoring-system

# Corrections de bugs
bugfix/login-validation-error
bugfix/memory-leak-fix

# Corrections urgentes
hotfix/security-patch
hotfix/critical-bug-fix

# Releases
release/v1.0.0
release/v1.1.0
```

#### Messages de commit

Nous utilisons le format [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types :**
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage, points-virgules manquants, etc.
- `refactor` : Refactoring du code
- `test` : Ajout de tests
- `chore` : Tâches de maintenance

**Exemples :**
```bash
feat(auth): add two-factor authentication
fix(api): resolve user profile update issue
docs(readme): update installation instructions
test(user): add unit tests for user service
chore(deps): update dependencies to latest versions
```

### Pull Requests

#### Avant de soumettre une PR

1. **Tests** : Assurez-vous que tous les tests passent
2. **Linting** : Vérifiez que le code respecte les standards
3. **Documentation** : Mettez à jour la documentation si nécessaire
4. **Commits** : Organisez vos commits de manière logique

#### Template de Pull Request

```markdown
## Description
Brève description des changements apportés.

## Type de changement
- [ ] Correction de bug
- [ ] Nouvelle fonctionnalité
- [ ] Changement cassant
- [ ] Documentation

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tests E2E ajoutés/mis à jour

## Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai effectué une auto-revue de mon code
- [ ] J'ai commenté mon code, particulièrement dans les zones difficiles
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests qui prouvent que ma correction est efficace
- [ ] Les tests passent avec mes changements
- [ ] Les changements sont compatibles avec les versions antérieures

## Screenshots (si applicable)
Ajoutez des captures d'écran pour les changements UI.

## Liens
- Issue liée : #123
- Documentation : [lien vers la doc]
```

## 📝 Standards de code

### TypeScript/JavaScript

#### Configuration ESLint

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Configuration Prettier

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### Bonnes pratiques

1. **Nommage** :
   - Variables et fonctions : `camelCase`
   - Classes : `PascalCase`
   - Constantes : `UPPER_SNAKE_CASE`

2. **Types** :
   - Utilisez TypeScript strict
   - Définissez des interfaces claires
   - Évitez `any`, utilisez `unknown`

3. **Fonctions** :
   - Fonctions pures quand possible
   - Une responsabilité par fonction
   - Documentation JSDoc pour les fonctions publiques

4. **Gestion d'erreurs** :
   - Utilisez des classes d'erreur personnalisées
   - Gérez les erreurs de manière appropriée
   - Loggez les erreurs avec du contexte

### Python (Service IA)

#### Configuration Black

```toml
[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''
```

#### Bonnes pratiques

1. **PEP 8** : Respectez les conventions PEP 8
2. **Type hints** : Utilisez les annotations de type
3. **Docstrings** : Documentez vos fonctions et classes
4. **Tests** : Écrivez des tests unitaires

## 🧪 Tests

### Structure des tests

```
tests/
├── unit/           # Tests unitaires
├── integration/    # Tests d'intégration
├── e2e/           # Tests end-to-end
└── fixtures/      # Données de test
```

### Écriture de tests

#### Tests unitaires

```typescript
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    userService = new UserService(mockUserRepository);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User' };
      mockUserRepository.save.mockResolvedValue({ id: '1', ...userData });

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual({ id: '1', ...userData });
      expect(mockUserRepository.save).toHaveBeenCalledWith(userData);
    });
  });
});
```

#### Tests d'intégration

```typescript
describe('Auth API Integration', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should register a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
  });
});
```

### Couverture de code

- **Minimum** : 80% de couverture
- **Objectif** : 90% de couverture
- **Critique** : 100% pour les modules de sécurité

## 📚 Documentation

### Types de documentation

1. **Documentation technique** : Architecture, API, déploiement
2. **Documentation utilisateur** : Guides d'utilisation
3. **Documentation développeur** : Standards, processus
4. **Documentation API** : Endpoints, exemples

### Standards de documentation

1. **Clarté** : Écrivez de manière claire et concise
2. **Exemples** : Incluez des exemples pratiques
3. **Mise à jour** : Maintenez la documentation à jour
4. **Format** : Utilisez Markdown pour la cohérence

### Documentation du code

```typescript
/**
 * Crée un nouvel utilisateur avec les données fournies
 * @param userData - Données de l'utilisateur à créer
 * @param userData.email - Email de l'utilisateur (unique)
 * @param userData.password - Mot de passe (sera haché)
 * @param userData.firstName - Prénom de l'utilisateur
 * @param userData.lastName - Nom de famille de l'utilisateur
 * @returns Promise résolue avec l'utilisateur créé
 * @throws {ValidationError} Si les données sont invalides
 * @throws {DuplicateError} Si l'email existe déjà
 * @example
 * ```typescript
 * const user = await userService.createUser({
 *   email: 'john@example.com',
 *   password: 'Password123!',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * ```
 */
async createUser(userData: CreateUserData): Promise<User> {
  // Implémentation...
}
```

## 🐛 Rapports de bugs

### Template de rapport de bug

```markdown
## Description du bug
Description claire et concise du bug.

## Étapes pour reproduire
1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler vers '...'
4. Voir l'erreur

## Comportement attendu
Description claire et concise de ce qui devrait se passer.

## Comportement actuel
Description claire et concise de ce qui se passe actuellement.

## Captures d'écran
Si applicable, ajoutez des captures d'écran.

## Environnement
- OS : [ex. Windows 10, macOS 12.0, Ubuntu 20.04]
- Navigateur : [ex. Chrome 91, Firefox 89, Safari 14]
- Version : [ex. 1.0.0]

## Informations supplémentaires
Ajoutez tout autre contexte utile.
```

## 💡 Suggestions d'améliorations

### Template de suggestion

```markdown
## Description de l'amélioration
Description claire et concise de l'amélioration proposée.

## Problème résolu
Quel problème cette amélioration résout-elle ?

## Solution proposée
Description détaillée de la solution proposée.

## Alternatives considérées
Description des alternatives considérées et pourquoi elles ont été rejetées.

## Contexte supplémentaire
Ajoutez tout autre contexte ou captures d'écran.
```

## ❓ Questions et support

### Où obtenir de l'aide

1. **Issues GitHub** : Pour les bugs et suggestions
2. **Discussions GitHub** : Pour les questions générales
3. **Email** : dev@coachprotalent.com
4. **Discord** : [Serveur Discord de la communauté]

### Réponse aux questions

- **Temps de réponse** : 2-3 jours ouvrables
- **Format** : Réponses claires et constructives
- **Suivi** : Nous suivons les discussions jusqu'à résolution

## 🏆 Reconnaissance

### Types de contributions reconnues

1. **Code** : Développement de fonctionnalités
2. **Tests** : Amélioration de la couverture de tests
3. **Documentation** : Amélioration de la documentation
4. **Design** : Amélioration de l'interface utilisateur
5. **Community** : Aide aux autres contributeurs

### Système de reconnaissance

- **Contributeurs** : Mention dans le README
- **Mainteneurs** : Accès aux permissions de repository
- **Sponsors** : Mention spéciale sur le site web

## 📄 Licence

En contribuant à ce projet, vous acceptez que vos contributions soient sous la même licence que le projet (MIT).

## 🙏 Remerciements

Merci à tous les contributeurs qui rendent ce projet possible !

---

**Besoin d'aide ?** N'hésitez pas à ouvrir une issue ou à nous contacter !
