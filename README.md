# SSL Certificate Check Action

Check SSL certificates for multiple domains in your GitHub workflows.

Uses [SSL Bulk Status API](https://ssl.easydmn.com) to validate certificates in CI/CD pipelines.

## Quick Start
```yaml
- uses: EasyDaemon/ssl-check-action@v1
  with:
    api_key: ${{ secrets.SSL_API_KEY }}
    domains: |
      example.com
      api.example.com
```

## Get API Key

**Free tier (testing):**
```bash
curl -X POST https://ssl.easydmn.com/create-free-key
```

**Production:**
- Pro: €10/month (5,000 checks)
- Pro+: €25/month (50,000 checks)

Learn more: [SSL Bulk Status API](https://easydmn.com)

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api_key` | Yes | - | SSL Bulk Status API key |
| `domains` | Yes | - | Domains to check (one per line or comma-separated) |
| `fail_on_warning` | No | `false` | Fail if certificate expires in <14 days |
| `fail_on_critical` | No | `true` | Fail if certificate is expired/invalid |

## Outputs

| Output | Description |
|--------|-------------|
| `results` | JSON results from SSL check |
| `critical_count` | Number of critical issues |
| `warning_count` | Number of warnings |

## Examples

### Pre-deployment Check
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  ssl-check:
    runs-on: ubuntu-latest
    steps:
      - uses: EasyDaemon/ssl-check-action@v1
        with:
          api_key: ${{ secrets.SSL_API_KEY }}
          domains: 'example.com,api.example.com'
          
  deploy:
    needs: ssl-check
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: ./deploy.sh
```

### Daily Monitoring
```yaml
name: SSL Monitor

on:
  schedule:
    - cron: '0 8 * * *'  # Every day at 8 AM

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: EasyDaemon/ssl-check-action@v1
        with:
          api_key: ${{ secrets.SSL_API_KEY }}
          domains: |
            example.com
            api.example.com
            app.example.com
          fail_on_warning: true
```

### Multiple Domains
```yaml
- uses: EasyDaemon/ssl-check-action@v1
  with:
    api_key: ${{ secrets.SSL_API_KEY }}
    domains: |
      example.com
      api.example.com
      app.example.com
      cdn.example.com
```

## Status Results

The action returns three clear states:

- **OK** - Certificate valid (>14 days remaining)
- **WARNING** - Expires in 1-14 days
- **CRITICAL** - Expired, invalid, or unreachable

## Full API Documentation

For direct API usage, cron jobs, or other integrations:
[SSL Bulk Status API Documentation](https://github.com/EasyDaemon/ssl-bulk-api-docs)

## Support

- Issues: [GitHub Issues](https://github.com/EasyDaemon/ssl-check-action/issues)
- Email: mail@easydmn.com

## License

MIT
