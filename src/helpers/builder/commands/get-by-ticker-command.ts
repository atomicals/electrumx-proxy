import { AtomicalsGetFetchType, CommandInterface } from './command.interface';
import { decorateAtomical } from '../atomical-format-helpers';
import { GetCommand } from './get-command';
import { ElectrumApiInterface } from '../services/electrum-api.interface';
 
export class GetByTickerCommand implements CommandInterface {
  constructor(
    private electrumApi: ElectrumApiInterface,
    private ticker: string,
    private fetchType: AtomicalsGetFetchType = AtomicalsGetFetchType.GET,
    private path?: string,
    private verbose?: boolean
  ) { }
  async run(): Promise<any> {
    const responseResult = await this.electrumApi.atomicalsGetByTicker(this.ticker);
    if (!responseResult.result || !responseResult.result.atomical_id) {
      console.log(responseResult);
      return {
        success: false,
        data: responseResult.result,
      };
    }
    const getDefaultCommand = new GetCommand(
      this.electrumApi,
      responseResult.result.atomical_id,
      this.fetchType,
      this.path,
      this.verbose
    );
    const getDefaultCommandResponse = await getDefaultCommand.run();
    const updatedRes = Object.assign({}, getDefaultCommandResponse.data, {
      result: decorateAtomical(getDefaultCommandResponse.data.result),
    });
    return {
      success: true,
      data: updatedRes,
    };
  }
}
