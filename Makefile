.PHONY: discord-bot

discord-bot/start:
	@set -a && . ./.env && set +a && \
	DISCORD_STATE_DIR="$$HOME/.claude/channels/mimi-discord" \
	claude --channels plugin:discord@claude-plugins-official
