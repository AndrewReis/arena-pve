# GitHub Actions + AWS

O workflow `.github/workflows/deploy-pr.yml` atualiza o Lambda existente para cada PR direcionado a `main`:

- ao abrir, reabrir ou atualizar o PR: executa build, testes, empacotamento e deploy;
- os deploys são serializados para evitar que PRs concorrentes sobrescrevam o Lambda simultaneamente;
- o destino padrão é `arn:aws:lambda:us-east-1:874127473392:function:adwdev-poc`.

Configure no repositório:

- Secret `AWS_ROLE_TO_ASSUME`: ARN da role IAM assumida pelo GitHub Actions via OIDC;
- Variable `AWS_REGION`: região AWS, opcional; o padrão é `us-east-1`.
- Variable `LAMBDA_FUNCTION_ARN`: ARN do Lambda, opcional; usa o ARN acima por padrão.

A role deve confiar no provider OIDC `token.actions.githubusercontent.com`, limitar o claim `sub` ao repositório e permitir `lambda:UpdateFunctionCode` e `lambda:GetFunctionConfiguration` para o ARN do Lambda. Não use access keys estáticas no GitHub.

O pacote publica o handler `dist/handler.handler`. O API Gateway existente deve estar integrado ao Lambda e conter as rotas `GET /health-check`, `POST /game`, `GET /game/{gameId}/state` e `POST /game/{gameId}/apply-action`. O `template.yaml` permanece disponível para uma futura migração da infraestrutura manual para SAM.
