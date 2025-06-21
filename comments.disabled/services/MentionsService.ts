import { MentionSuggestion, User } from '../types';

export class MentionsService {
  private static instance: MentionsService;
  private baseUrl = '/api/mentions';

  static getInstance(): MentionsService {
    if (!MentionsService.instance) {
      MentionsService.instance = new MentionsService();
    }
    return MentionsService.instance;
  }

  // Get user suggestions for @-mentions
  async getSuggestions(
    query: string,
    entityType?: string,
    entityId?: string,
    limit: number = 10
  ): Promise<MentionSuggestion[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    
    if (entityType) params.append('entity_type', entityType);
    if (entityId) params.append('entity_id', entityId);

    const response = await fetch(`${this.baseUrl}/suggestions?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch mention suggestions: ${response.statusText}`);
    }

    return response.json();
  }

  // Parse mentions from text content
  parseMentions(content: string): string[] {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[2]); // Extract user ID from mention
    }

    return mentions;
  }

  // Format mentions in text for display
  formatMentionsForDisplay(content: string, users: User[]): string {
    const userMap = new Map(users.map(user => [user.id, user]));
    
    return content.replace(
      /@\[([^\]]+)\]\(([^)]+)\)/g,
      (match, displayName, userId) => {
        const user = userMap.get(userId);
        if (user) {
          return `<span class="mention" data-user-id="${userId}">@${user.full_name || user.email}</span>`;
        }
        return match;
      }
    );
  }

  // Format mentions for editor (markdown-like format)
  formatMentionForEditor(user: User): string {
    const displayName = user.full_name || user.email;
    return `@[${displayName}](${user.id})`;
  }

  // Extract mentioned user IDs from formatted text
  extractMentionIds(content: string): string[] {
    return this.parseMentions(content);
  }

  // Validate that mentioned users exist and have permissions
  async validateMentions(
    userIds: string[],
    entityType: string,
    entityId: string
  ): Promise<{ valid: string[]; invalid: string[] }> {
    const response = await fetch(`${this.baseUrl}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_ids: userIds,
        entity_type: entityType,
        entity_id: entityId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to validate mentions: ${response.statusText}`);
    }

    return response.json();
  }

  // Get users by IDs (for populating mention data)
  async getUsersByIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) return [];

    const params = new URLSearchParams();
    userIds.forEach(id => params.append('ids', id));

    const response = await fetch(`${this.baseUrl}/users?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  }

  // Create notification for mentioned users
  async notifyMentionedUsers(
    commentId: string,
    mentionedUserIds: string[],
    entityType: string,
    entityId: string
  ): Promise<void> {
    if (mentionedUserIds.length === 0) return;

    const response = await fetch(`${this.baseUrl}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment_id: commentId,
        mentioned_user_ids: mentionedUserIds,
        entity_type: entityType,
        entity_id: entityId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to notify mentioned users: ${response.statusText}`);
    }
  }

  // Check if current user can mention others in this context
  async canMention(entityType: string, entityId: string): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/can-mention?entity_type=${entityType}&entity_id=${entityId}`
    );
    
    if (!response.ok) {
      return false; // Default to false if we can't check permissions
    }

    const result = await response.json();
    return result.can_mention;
  }

  // Get recent mentions for current user
  async getRecentMentions(limit: number = 10): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/recent?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch recent mentions: ${response.statusText}`);
    }

    return response.json();
  }
} 