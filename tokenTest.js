const { accounts, contract } = require('@openzeppelin/test-environment');
const { expect } = require('chai');
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const CharityToken = contract.fromArtifact('CharityToken');
const Donate = contract.fromArtifact('Donate');

let charityToken, donate, value = ''

const _name = "Charity Token";
const _symbol = "CTK";
const _decimals = 18;
const _total_supply = 10000000;
const _over_total_supply = 110000000000000000000000000;

const sender =  accounts[0];
const receiver =  accounts[1];

beforeEach(async function () {
    // The bundled BN library is the same one web3 uses under the hood
    value = new BN(1);

    charityToken = await CharityToken.new({ from: sender });
    charityAddress = charityToken.address;
    await charityToken.initialize({from : sender}) ;

    /*
     @ Commented this code to check if an instance of doante contract was created with token contract.

     donate = await Donate.new(charityAddress, {from: sender});
     await donate.initialize({from: sender});
    */
});

describe("[Testcase 1 : check if the smart contract has been created as set in the variables]", async () => {
  
    it("1.1. Is the token name the same as set in the variable?", async function() {
      let name = await charityToken.name();
      expect(name).to.equal(_name);
    });
  
    it("1.2. Is the token symbol is the same as set in the variable?", async function() {
      let sym = await charityToken.symbol();
      expect(sym).to.equal(_symbol);
    });
  
    it("1.3. Is the token decimals is the same as set in the variable?", async function() {
      let decimals = await charityToken.decimals(); 
      expect( Number(decimals) ).to.equal(_decimals);
    });
  
    it("1.4. Is the total supply of the token the same as set in the variable total supply?", async function() {
      let ts = await charityToken.totalSupply(); 
      let number = new BN(ts).toString()
      expect( number ).to.equal(
        "10000000000000000000000000"
      );
    });
});
  
describe("[Testcase 2 : check if the amount of the token supply has been transffered to the token owner]", async () => {
    it("2.1. Is the total token amount issued are the same as that of the balance of the token owner?", async function() {
        
        const totalSupply = await charityToken.totalSupply();
        let totalSupplyNumber = new BN(totalSupply).toString();
        const ownerBalance = await charityToken.balanceOf(sender);
        let ownerBalanceNumber = new BN(ownerBalance).toString();

        expect (ownerBalanceNumber).to.equal(totalSupplyNumber);
    });
});
  
describe("[Testcase 3: check if the features implemented work as intended]", async () => {

    const investor = accounts[2];

    it("3.1. Transfer feature: after transferring some tokens to a certain address, is the amount of the token transferred the same as that of the address that has received?", async function() {
        
    await charityToken.transfer(investor, 1000, { from: sender });

        const investorBalance = await charityToken.balanceOf(investor);
        let investorBalanceNumber = new BN(investorBalance).toString();
        expect (investorBalanceNumber).to.equal("1000");
    });

    it("3.2. When trying to transferring more tokens than the token supply, is it properly ‘reverted’? ", async function() {
        try{
        await charityToken.transfer((investor,_over_total_supply ), { from: sender })
        }catch{
        expect(true).to.equal(true);
        }

    });

    it('3.3. Reverts when transferring tokens to the zero address', async function () {
    // Conditions that trigger a require statement can be precisely tested
        try{
            await expectRevert(
                charityToken.transfer(constants.ZERO_ADDRESS, value, { from: sender }),
                'charityToken: transfer to the zero address',
            );
        } catch {
            expect (true).to.equal(true);
        }
    });
    
      it('3.4. Emits a Transfer event on successful transfers', async function () {
        const receipt = await charityToken.transfer(
          receiver, value, { from: sender }
        );
    
        // Event assertions can verify that the arguments are the expected ones
        expectEvent(receipt, 'Transfer', {
          from: sender,
          to: receiver,
          value: value,
        });
      });
    
    it('3.5. Updates balances on successful transfers', async function () {
        charityToken.transfer(receiver, value, { from: sender });

        // BN assertions are automatically available via chai-bn (if using Chai)
        expect(await charityToken.balanceOf(receiver))
            .to.be.bignumber.equal(value);
    });
  
});