```bash
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-4o-mini"
```

- Start the dev server:

```bash
npm run dev
```

- Build and test:

```bash
npm run build
npm test
```

- Package/deploy with AWS SAM:

```bash
sam build
sam deploy --guided
```

The Lambda handler is `dist/handler.handler`, exposed through `GET /health-check`, `POST /game`,
`GET /game/{gameId}/state`, and `POST /game/{gameId}/apply-action`.
