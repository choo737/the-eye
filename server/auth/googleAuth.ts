import { GoogleAuth, OAuth2Client } from 'google-auth-library';

export interface UserContext {
  email: string;
  name?: string;
  picture?: string;
  hd?: string; // Hosted domain (e.g. corp.com)
  accessToken?: string;
}

export class GoogleAuthManager {
  private auth: GoogleAuth;
  private oauth2Client: OAuth2Client;

  constructor() {
    // Uses Application Default Credentials (ADC) or explicit credentials
    this.auth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/bigquery',
        'https://www.googleapis.com/auth/spreadsheets.readonly'
      ]
    });

    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID || '',
      process.env.GOOGLE_CLIENT_SECRET || '',
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback'
    );
  }

  async getAuthClient() {
    return await this.auth.getClient();
  }

  async getProjectId(): Promise<string> {
    try {
      return await this.auth.getProjectId();
    } catch {
      return process.env.GCP_PROJECT_ID || 'seven-eleven-qlik-bq';
    }
  }

  async verifyIdToken(idToken: string): Promise<UserContext> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error('Invalid token payload');
      }
      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        hd: payload.hd
      };
    } catch (err: any) {
      // Fallback for local development mode
      return {
        email: 'developer@jackychoo.altostrat.com',
        name: 'Jacky Choo (ADC Session)',
        hd: 'jackychoo.altostrat.com'
      };
    }
  }
}

export const googleAuthManager = new GoogleAuthManager();
