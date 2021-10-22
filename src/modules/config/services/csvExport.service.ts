import { Injectable } from '@nestjs/common';
import { ExportToCsv } from 'export-to-csv';

@Injectable()
export class ExportCsvService {
  public async exportCsv(body: Record<string, any>, entityName: string): Promise<string> {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: `${entityName}`,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };

    const csvExporter = new ExportToCsv(options);

    return csvExporter.generateCsv(body, true);
  }
}
