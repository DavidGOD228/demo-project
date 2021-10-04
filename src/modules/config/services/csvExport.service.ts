import { Injectable } from '@nestjs/common';
import { ExportToCsv } from 'export-to-csv';

@Injectable()
export class ExportCsvService {
  public async exportCsv(body: Record<string, any>) {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'users',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };

    const csvExporter = new ExportToCsv(options);

    return csvExporter.generateCsv(body, true);
  }
}
