import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import * as mammoth from 'mammoth';

@Injectable()
export class DataService {
    constructor() {}

    async chatGptDataPreparationService(path: string) {
        try {
            const traingData: string[] = [];
            const filenames = fs.readdirSync(path);

            for (const filename of filenames) {
                const filePath = `${path}/${filename}`;
                const fileBuffer = fs.readFileSync(filePath);

                const result = await mammoth.extractRawText({ path: filePath });
                const lines = result.value.split('\n');

                for (const line of lines) {
                    if (line.length > 0) {
                        traingData.push(line);
                    }
                }
            }

            return traingData;
        } catch (err) {
            console.log(err);
        }
    }
}