import { BigQuery } from '@google-cloud/bigquery';
import { UserContext } from '../auth/googleAuth';

export class BigQueryConnector {
  private bigquery: BigQuery;
  private defaultProject: string;

  constructor(projectId: string = 'seven-eleven-qlik-bq') {
    this.defaultProject = projectId;
    this.bigquery = new BigQuery({
      projectId: this.defaultProject
    });
  }

  async testConnection(projectId?: string): Promise<{ success: boolean; message: string; datasets: string[] }> {
    try {
      const targetProject = projectId || this.defaultProject;
      const bq = new BigQuery({ projectId: targetProject });
      const [datasets] = await bq.getDatasets();
      const datasetNames = datasets.map(d => d.id || '');
      return {
        success: true,
        message: `Successfully connected to BigQuery project "${targetProject}"`,
        datasets: datasetNames
      };
    } catch (err: any) {
      return {
        success: false,
        message: `BigQuery connection failed: ${err.message}`,
        datasets: []
      };
    }
  }

  async listTables(datasetId: string, projectId?: string): Promise<string[]> {
    const targetProject = projectId || this.defaultProject;
    const bq = new BigQuery({ projectId: targetProject });
    const [tables] = await bq.dataset(datasetId).getTables();
    return tables.map(t => t.id || '');
  }

  async executeQuery(
    query: string, 
    params: Record<string, any> = {}, 
    userContext?: UserContext
  ): Promise<{ columns: string[]; rows: any[]; totalRows: number; durationMs: number; bytesProcessed?: number }> {
    const startTime = Date.now();
    try {
      // Run dry-run first for safety and cost estimation
      const [job] = await this.bigquery.createQueryJob({
        query,
        params,
        dryRun: false,
        location: 'asia-southeast1' // or asia-southeast1
      });

      const [rows] = await job.getQueryResults();
      const [metadata] = await job.getMetadata();

      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      const durationMs = Date.now() - startTime;
      const bytesProcessed = metadata?.statistics?.query?.totalBytesProcessed;

      return {
        columns,
        rows,
        totalRows: rows.length,
        durationMs,
        bytesProcessed: bytesProcessed ? parseInt(bytesProcessed) : undefined
      };
    } catch (err: any) {
      throw new Error(`BigQuery execution error on project [${this.defaultProject}]: ${err.message}`);
    }
  }
}

export const bigqueryConnector = new BigQueryConnector('seven-eleven-qlik-bq');
