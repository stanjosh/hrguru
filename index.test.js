import { jest } from '@jest/globals'
import createEmployee from "./index"
jest.useFakeTimers()

await describe("Employee Database Functions", () => {
    it('should return something', async () => {
        return createEmployee().then(data => {
            expect(data).not.toBeUndefined();
            
        })     
        
    })
    
});


